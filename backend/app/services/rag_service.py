import json
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.models.base import is_pgvector_available
from app.models.document import Document, DocumentChunk
from app.models.product import Product
from app.models.chat import ChatSession, ChatMessage
from app.services.embedding_service import EmbeddingService
from app.services.recommendation_service import RecommendationService

class RAGService:
    @staticmethod
    def retrieve_chunks(
        db: Session,
        query: str,
        top_k: int = 5,
        product_id: Optional[int] = None
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        Retrieves top-k most semantically similar chunks from the database.
        Uses pgvector distance on PostgreSQL or Cosine Similarity on SQLite/MySQL.
        """
        query_vector = EmbeddingService.get_embedding(query)

        # Check if running PostgreSQL with active pgvector extension
        if "postgresql" in settings.DATABASE_URL and is_pgvector_available():
            try:
                # Query using pgvector cosine distance operator <=>
                vec_str = "[" + ",".join(str(x) for x in query_vector) + "]"
                where_clause = "WHERE embedding IS NOT NULL"
                params: Dict[str, Any] = {"vec": vec_str, "top_k": top_k}
                if product_id:
                    where_clause += " AND (product_id = :product_id OR product_id IS NULL)"
                    params["product_id"] = product_id

                sql = text(f"""
                    SELECT id, document_id, product_id, chunk_text, chunk_index,
                           1 - (embedding <=> CAST(:vec AS vector)) AS similarity
                    FROM document_chunks
                    {where_clause}
                    ORDER BY embedding <=> CAST(:vec AS vector)
                    LIMIT :top_k
                """)
                result = db.execute(sql, params).fetchall()
                chunks_with_score = []
                for row in result:
                    chunk = DocumentChunk(
                        id=row[0],
                        document_id=row[1],
                        product_id=row[2],
                        chunk_text=row[3],
                        chunk_index=row[4]
                    )
                    chunks_with_score.append((chunk, float(row[5])))
                if chunks_with_score:
                    return chunks_with_score
            except Exception as e:
                db.rollback()
                print(f"Notice: pgvector direct query error ({e}), falling back to memory cosine.")

        # Universal fallback: fetch chunks and compute cosine distance in Python
        query_stmt = db.query(DocumentChunk)
        if product_id:
            query_stmt = query_stmt.filter(
                (DocumentChunk.product_id == product_id) | (DocumentChunk.product_id == None)
            )
        all_chunks = query_stmt.all()
        if not all_chunks:
            return []

        scored = []
        for ch in all_chunks:
            if not ch.embedding:
                continue
            emb = ch.embedding
            if isinstance(emb, str):
                try:
                    emb = json.loads(emb)
                except Exception:
                    continue
            sim = EmbeddingService.compute_cosine_similarity(query_vector, emb)
            scored.append((ch, sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    @staticmethod
    def _build_lc_history(history: Optional[List[Tuple[str, str]]]) -> List[Any]:
        """Converts (role, message) tuples into LangChain message objects."""
        if not history:
            return []
        from langchain_core.messages import AIMessage, HumanMessage

        lc_messages: List[Any] = []
        for role, content in history:
            if role == "user":
                lc_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                lc_messages.append(AIMessage(content=content))
        return lc_messages

    @staticmethod
    def call_gemini_llm(
        prompt: str,
        *,
        system_prompt: Optional[str] = None,
        history: Optional[List[Tuple[str, str]]] = None,
    ) -> Optional[str]:
        """Invokes Google Gemini via LangChain ChatGoogleGenerativeAI with automatic model fallback."""
        api_key = (settings.GEMINI_API_KEY or "").strip()
        if not api_key or api_key.startswith("your_"):
            return None

        candidate_models = []
        for m in [settings.GEMINI_MODEL, "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"]:
            if m and m not in candidate_models:
                candidate_models.append(m)

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
            from langchain_core.output_parsers import StrOutputParser

            sys_text = system_prompt or (
                "You are BuySmart's expert AI Shopping Assistant. "
                "Answer factually using only the grounded database context provided."
            )
            chat_prompt = ChatPromptTemplate.from_messages([
                ("system", "{system_instruction}"),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{user_input}"),
            ])
            lc_history = RAGService._build_lc_history(history)

            for model_name in candidate_models:
                try:
                    llm = ChatGoogleGenerativeAI(
                        model=model_name,
                        google_api_key=api_key,
                        temperature=0.2,
                        max_retries=1,
                        timeout=15,
                    )
                    chain = chat_prompt | llm | StrOutputParser()
                    reply = chain.invoke({
                        "system_instruction": sys_text,
                        "history": lc_history,
                        "user_input": prompt,
                    })
                    if reply and reply.strip():
                        return reply.strip()
                except Exception as model_err:
                    print(f"LangChain Gemini error ({model_name}): {model_err}")
        except Exception as e:
            print(f"LangChain Gemini setup error: {e}")
        return None

    @staticmethod
    def _product_display_name(product: Product) -> str:
        """Avoids duplicating the brand when the product title already begins with it."""
        if product.name.lower().startswith(product.brand.lower()):
            return product.name
        return f"{product.brand} {product.name}"

    @staticmethod
    def generate_grounded_response(
        query: str,
        retrieved_chunks: List[Tuple[DocumentChunk, float]],
        matching_products: List[Product],
        intent: Dict[str, Any],
        doc_types: Optional[Dict[int, str]] = None,
    ) -> str:
        """
        Synthesizes a helpful, factual response using retrieved RAG chunks
        and live database product records. Used directly or as prompt ground-truth.
        """
        lines = []
        doc_types = doc_types or {}

        # 1. Product Recommendations first when matching products exist
        if matching_products:
            lines.append("Here are the top verified options based on your request:\n")
            highlight_keys = [
                "Processor", "GPU", "RAM", "Storage", "Display",
                "Battery", "Rear Camera", "Camera", "Noise Cancellation",
            ]
            for i, p in enumerate(matching_products, 1):
                specs_summary = ""
                if p.specs_dict:
                    specs_parts = [f"{k}: {p.specs_dict[k]}" for k in highlight_keys if k in p.specs_dict]
                    if specs_parts:
                        specs_summary = f" ({', '.join(specs_parts[:5])})"

                stock_str = f"In Stock ({p.stock_quantity} available)" if p.stock_quantity > 0 else "Currently Out of Stock"
                disp_name = RAGService._product_display_name(p)
                lines.append(f"### {i}. [{disp_name}](#product-{p.id})")
                lines.append(f"- **Price**: ₹{p.price:,.2f}")
                lines.append(f"- **Availability**: {stock_str}")
                lines.append(f"- **Specs**: {p.description}{specs_summary}")

                if p.price <= 30000:
                    lines.append("- **Advantage**: Strong value for money in the budget segment.")
                elif p.price >= 80000:
                    lines.append("- **Advantage**: Flagship performance and premium build quality.")
                else:
                    lines.append("- **Advantage**: Balanced performance suited for multitasking and modern workloads.")
                lines.append("")

        # 2. Budget verification note
        if intent.get("max_budget") and matching_products:
            budget_val = intent["max_budget"]
            within_budget = [p for p in matching_products if p.price <= budget_val]
            if len(within_budget) == len(matching_products):
                lines.append(f"> **Budget Check**: All recommended items are strictly within your budget of ₹{budget_val:,.2f}.\n")
            elif within_budget:
                lines.append(f"> **Budget Check**: {len(within_budget)} of {len(matching_products)} options are strictly under ₹{budget_val:,.2f} (plus close alternatives within 5%).\n")

        # 3. Knowledge Base & Policy answers from chunks
        #    When products are already shown, only surface store policy chunks (not generic buying guides that may list out-of-budget items).
        policy_chunks = [(ch, score) for ch, score in retrieved_chunks if not ch.product_id]
        if matching_products:
            relevant_policy_chunks = [
                (ch, score)
                for ch, score in policy_chunks
                if doc_types.get(ch.document_id) == "policy" and score >= 0.35
            ]
        else:
            relevant_policy_chunks = policy_chunks

        if relevant_policy_chunks:
            lines.append("### Store Policy & Verified Guide")
            for ch, _score in relevant_policy_chunks[:2]:
                lines.append(f"{ch.chunk_text.strip()}\n")

        if not lines:
            lines.append("I couldn't find an exact match in our current catalog for that specific query. Please try adjusting your budget or searching for related electronics (Smartphones, Laptops, Audio, or Smartwatches).")

        return "\n".join(lines)

    @classmethod
    def answer_query(
        cls,
        db: Session,
        query: str,
        session_id: Optional[int] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Complete End-to-End RAG execution:
        1. Manage ChatSession and log user message.
        2. Retrieve relevant document chunks.
        3. Retrieve live product candidates via Recommendation Engine.
        4. Assemble Grounded Prompt.
        5. Invoke Gemini LLM (or robust local synthesis).
        6. Persist Assistant response and return structured payload.
        """
        # Ensure session exists and belongs to the caller (if owned)
        session = None
        if session_id:
            candidate_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if candidate_session and (
                candidate_session.user_id is None or candidate_session.user_id == user_id
            ):
                session = candidate_session

        if not session:
            session = ChatSession(user_id=user_id)
            db.add(session)
            db.flush()

        # Fetch recent conversation turns before appending the current message
        prior_rows = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.id.desc())
            .limit(6)
            .all()
        )
        chat_history = [(m.role, m.message) for m in reversed(prior_rows)]

        # Log user message
        user_msg = ChatMessage(session_id=session.id, role="user", message=query)
        db.add(user_msg)
        db.commit()

        # 1. Hybrid recommendation
        matching_products, intent = RecommendationService.get_recommendations(db, query, limit=3)

        # 2. Vector chunk retrieval & relevance filtering
        raw_chunks = cls.retrieve_chunks(db, query, top_k=4)
        min_sim = 0.20 if not matching_products else 0.35
        retrieved_chunks = [(ch, sc) for ch, sc in raw_chunks if sc >= min_sim]
        if not retrieved_chunks and raw_chunks and not matching_products:
            retrieved_chunks = raw_chunks[:2]

        # Collect source titles & document types
        sources = set()
        doc_types: Dict[int, str] = {}
        for ch, _ in retrieved_chunks:
            doc = db.query(Document).filter(Document.id == ch.document_id).first()
            if doc:
                sources.add(doc.title)
                doc_types[doc.id] = doc.document_type

        if matching_products:
            sources.add("BuySmart Verified Product Catalog")

        # 3. Grounded Context Construction
        fallback_reply = cls.generate_grounded_response(
            query, retrieved_chunks, matching_products, intent, doc_types=doc_types
        )
        
        # Format prompt for LangChain Gemini chat model
        products_context = []
        for p in matching_products:
            disp_name = cls._product_display_name(p)
            products_context.append(
                f"- Product ID: {p.id}, Display Name: {disp_name}, Brand: {p.brand}, Price: ₹{p.price:,.2f}, Stock: {p.stock_quantity}, Description: {p.description}, Specs: {p.specifications}"
            )
        products_text = "\n".join(products_context) if products_context else "None"

        chunks_text = "\n\n".join([f"[Source: Chunk {ch.id}]: {ch.chunk_text}" for ch, _ in retrieved_chunks]) or "None"

        system_prompt = """You are BuySmart's expert AI Shopping Assistant. Answer the customer's shopping question factually, concisely, and politely in Markdown.

RULES:
1. NEVER invent product prices, stock availability, specifications, or store policies. Rely ONLY on the LIVE DATABASE PRODUCTS and KNOWLEDGE BASE & POLICY CHUNKS provided below.
2. If recommending products, explain WHY they fit the customer's request, highlight key specs, and note advantages and trade-offs.
3. Mention prices in Indian Rupees (₹).
4. Respect customer budget constraints strictly.
5. Link every referenced product using the exact Markdown format [Display Name](#product-ID), e.g., [ASUS TUF Gaming F15](#product-2).
6. If the customer asks a store policy/return/warranty/shipping question and no products are listed, answer directly from the policy chunks without inventing product recommendations."""

        user_prompt = f"""USER QUESTION:
{query}

LIVE DATABASE PRODUCTS (Strict Ground Truth):
{products_text}

KNOWLEDGE BASE & POLICY CHUNKS:
{chunks_text}

Provide a well-structured, grounded answer in Markdown:"""

        # Call LangChain ChatGoogleGenerativeAI or fall back to deterministic grounded synthesis
        llm_reply = cls.call_gemini_llm(user_prompt, system_prompt=system_prompt, history=chat_history)
        final_reply = llm_reply if llm_reply else fallback_reply

        # Persist assistant turn
        asst_msg = ChatMessage(session_id=session.id, role="assistant", message=final_reply)
        db.add(asst_msg)
        db.commit()

        # Build referenced products response
        ref_products = []
        for p in matching_products:
            ref_products.append({
                "id": p.id,
                "name": p.name,
                "brand": p.brand,
                "price": p.price,
                "stock_quantity": p.stock_quantity,
                "image_url": p.image_url,
                "specifications": p.specs_dict,
                "reason": f"Matches query requirements within target price range."
            })

        return {
            "session_id": session.id,
            "reply": final_reply,
            "referenced_products": ref_products,
            "sources": list(sources),
            "detected_budget": intent.get("max_budget"),
            "detected_category": intent.get("category_hint")
        }

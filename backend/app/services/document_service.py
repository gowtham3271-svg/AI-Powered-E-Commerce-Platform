from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.services.embedding_service import EmbeddingService
from app.core.config import settings

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except ImportError:
        RecursiveCharacterTextSplitter = None

class DocumentService:
    @staticmethod
    def split_text(text: str, chunk_size: int = None, chunk_overlap: int = None) -> List[str]:
        """Splits document text into overlapping semantic chunks."""
        size = chunk_size or settings.CHUNK_SIZE
        overlap = chunk_overlap or settings.CHUNK_OVERLAP

        if RecursiveCharacterTextSplitter:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=size,
                chunk_overlap=overlap,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            return splitter.split_text(text)
        
        # Simple fallback splitter if langchain splitter is missing
        chunks = []
        start = 0
        while start < len(text):
            end = start + size
            chunks.append(text[start:end])
            start += size - overlap
        return chunks

    @staticmethod
    def ingest_document(
        db: Session,
        title: str,
        content: str,
        document_type: str = "policy",
        source: Optional[str] = None,
        product_id: Optional[int] = None
    ) -> Document:
        """
        Ingests a knowledge document, chunks it, generates embeddings,
        and saves chunks into the database.
        """
        # Check if an identical document already exists
        existing = db.query(Document).filter(Document.title == title).first()
        if existing:
            # Delete existing chunks to re-index freshly
            db.query(DocumentChunk).filter(DocumentChunk.document_id == existing.id).delete()
            doc = existing
            doc.document_type = document_type
            doc.source = source
        else:
            doc = Document(
                title=title,
                document_type=document_type,
                source=source
            )
            db.add(doc)
            db.flush()

        chunks = DocumentService.split_text(content)
        if chunks:
            embeddings = EmbeddingService.get_embeddings(chunks)
            chunk_records = []
            for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
                chunk_record = DocumentChunk(
                    document_id=doc.id,
                    product_id=product_id,
                    chunk_text=chunk_text,
                    chunk_index=idx,
                    embedding=embedding
                )
                chunk_records.append(chunk_record)
            
            db.add_all(chunk_records)
        
        db.commit()
        db.refresh(doc)
        return doc

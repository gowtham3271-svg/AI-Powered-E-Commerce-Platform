import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product
from app.models.category import Category
from app.services.embedding_service import EmbeddingService

# In-memory cache of product embeddings keyed by (product_id, product_text)
_product_embedding_cache: Dict[Tuple[int, str], List[float]] = {}

_KEYWORD_SYNONYMS: Dict[str, List[str]] = {
    "ml": ["machine learning", "ml", "pytorch", "cuda", "rtx"],
    "machine learning": ["machine learning", "ml", "rtx", "gpu"],
    "coding": ["programming", "coding", "developer", "development", "software"],
    "programming": ["programming", "coding", "developer", "development", "software"],
    "anc": ["anc", "noise cancel"],
    "noise cancelling": ["noise cancelling", "noise canceling", "anc"],
    "oled": ["oled", "amoled", "poled"],
}

_POLICY_TRIGGERS = (
    "policy", "return", "refund", "replacement", "shipping", "delivery",
    "warranty", "payment", "cod", "upi", "tracking", "exchange", "price match",
    "student discount",
)


class RecommendationService:
    @staticmethod
    def parse_query_intent(query: str) -> Dict[str, Any]:
        """
        Extracts budget constraints, target category, brands, and key features from user prompt.
        """
        intent: Dict[str, Any] = {
            "max_budget": None,
            "min_budget": None,
            "category_hint": None,
            "brand_hint": None,
            "brand_hints": [],
            "keywords": [],
            "is_policy_query": False,
        }

        lower = query.lower()

        # 1. Budget extraction (require word boundary after multiplier so 'l' never matches 'laptop')
        budget_match = re.search(
            r'(?:under|below|less than|within|budget(?:\s+of)?|max(?:imum)?|up\s*to|around)'
            r'\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:(k|thousand|lakhs?|l)\b)?',
            lower,
        )
        if budget_match:
            val_str = budget_match.group(1).replace(",", "")
            val = float(val_str)
            multiplier = budget_match.group(2)
            if multiplier in ("k", "thousand"):
                val *= 1000
            elif multiplier in ("lakh", "lakhs", "l"):
                val *= 100000
            intent["max_budget"] = val

        # 2. Category extraction using word boundaries
        category_map = {
            "smartphone": ["smartphone", "phone", "mobile", "android", "iphone"],
            "laptop": ["laptop", "notebook", "macbook", "ultrabook", "pc", "computer"],
            "headphones": ["headphone", "earphone", "earbud", "airpods", "headset", "audio"],
            "smartwatch": ["smartwatch", "watch", "fitness tracker"],
            "accessories": ["charger", "mouse", "ssd", "cable", "adapter", "hub", "keyboard"],
        }
        for cat_name, aliases in category_map.items():
            if any(re.search(rf'\b{re.escape(alias)}s?\b', lower) for alias in aliases):
                intent["category_hint"] = cat_name
                break

        # 3. Brand extraction (collect all matching brands for multi-brand comparisons)
        popular_brands = [
            "apple", "samsung", "asus", "dell", "lenovo", "acer", "sony", "bose",
            "oneplus", "google", "xiaomi", "redmi", "realme", "boat", "sennheiser",
            "amazfit", "noise", "garmin", "logitech", "anker", "sandisk", "belkin",
            "hp", "motorola", "hyperx", "keychron", "nothing", "jbl",
        ]
        matched_brands = [
            b for b in popular_brands if re.search(rf'\b{re.escape(b)}\b', lower)
        ]
        intent["brand_hints"] = matched_brands
        intent["brand_hint"] = matched_brands[0] if matched_brands else None

        # 4. Keyword attributes
        feature_keywords = [
            "gaming", "battery", "camera", "lightweight", "programming", "coding",
            "machine learning", "ml", "fast charging", "anc", "noise cancelling",
            "16gb", "512gb", "oled", "amoled", "rtx", "5g", "gps", "mechanical",
            "ssd", "usb-c", "gan",
        ]
        for feat in feature_keywords:
            pattern = rf'\b{re.escape(feat)}\b' if len(feat) <= 4 else re.escape(feat)
            if re.search(pattern, lower):
                intent["keywords"].append(feat)

        # 5. Pure policy/service inquiry detection (when no catalog intent is specified)
        has_policy_term = any(re.search(rf'\b{re.escape(t)}\b', lower) for t in _POLICY_TRIGGERS)
        has_catalog_intent = bool(
            intent["max_budget"]
            or intent["category_hint"]
            or intent["brand_hints"]
            or intent["keywords"]
        )
        intent["is_policy_query"] = has_policy_term and not has_catalog_intent

        return intent

    @staticmethod
    def _get_product_embeddings(query: str, candidates: List[Product]) -> Tuple[List[float], List[List[float]]]:
        """Batch-encodes query and any uncached product texts in a single pass."""
        texts_to_encode = [query]
        prod_texts: List[str] = []
        uncached_indices: List[int] = []
        cached_vecs: Dict[int, List[float]] = {}

        for idx, p in enumerate(candidates):
            prod_text = f"{p.name} {p.brand} {p.description} {p.specifications or ''}"
            prod_texts.append(prod_text)
            cache_key = (p.id, prod_text)
            if cache_key in _product_embedding_cache:
                cached_vecs[idx] = _product_embedding_cache[cache_key]
            else:
                uncached_indices.append(idx)
                texts_to_encode.append(prod_text)

        encoded = EmbeddingService.get_embeddings(texts_to_encode)
        query_vec = encoded[0]

        for offset, idx in enumerate(uncached_indices):
            vec = encoded[1 + offset]
            p = candidates[idx]
            _product_embedding_cache[(p.id, prod_texts[idx])] = vec
            cached_vecs[idx] = vec

        return query_vec, [cached_vecs[i] for i in range(len(candidates))]

    @staticmethod
    def get_recommendations(
        db: Session,
        query: str,
        limit: int = 4
    ) -> Tuple[List[Product], Dict[str, Any]]:
        """
        Hybrid recommendation engine:
        1. Filters candidate products by SQL constraints (budget, category, in-stock).
        2. Scores products by semantic text relevance using embeddings and keyword matches.
        """
        intent = RecommendationService.parse_query_intent(query)

        if intent["is_policy_query"]:
            return [], intent

        stmt = db.query(Product)

        # Apply category filter if identified
        if intent["category_hint"]:
            stmt = stmt.join(Category).filter(
                or_(
                    Category.name.ilike(f"%{intent['category_hint']}%"),
                    Category.description.ilike(f"%{intent['category_hint']}%")
                )
            )

        # Apply budget filter
        if intent["max_budget"]:
            # Give a small 5% tolerance in case there is a standout product just slightly above
            stmt = stmt.filter(Product.price <= intent["max_budget"] * 1.05)

        candidates = stmt.all()
        if not candidates:
            # Fallback to all products within budget regardless of category
            if intent["max_budget"]:
                candidates = db.query(Product).filter(Product.price <= intent["max_budget"]).all()
            else:
                candidates = db.query(Product).all()

        if not candidates:
            return [], intent

        query_vec, prod_vecs = RecommendationService._get_product_embeddings(query, candidates)
        query_tokens = [
            tok for tok in re.findall(r'[a-z0-9\-]{3,}', query.lower())
            if tok not in {"for", "and", "the", "with", "under", "best", "which", "what", "compare", "need", "want"}
        ]

        scored_products = []
        for p, prod_vec in zip(candidates, prod_vecs):
            prod_text_lower = f"{p.name} {p.brand} {p.description} {p.specifications or ''}".lower()
            sim = EmbeddingService.compute_cosine_similarity(query_vec, prod_vec)

            bonus = 0.0
            for kw in intent["keywords"]:
                terms = _KEYWORD_SYNONYMS.get(kw, [kw])
                if any(t in prod_text_lower for t in terms):
                    bonus += 0.15

            if p.stock_quantity > 0:
                bonus += 0.05

            if intent["brand_hints"]:
                p_brand = p.brand.lower()
                if any(b in p_brand or (b == "redmi" and "xiaomi" in p_brand) for b in intent["brand_hints"]):
                    bonus += 0.35

            # Boost direct product name token hits (helps exact comparisons & named lookups)
            name_lower = p.name.lower()
            for tok in query_tokens:
                if tok in name_lower:
                    bonus += 0.18

            total_score = sim + bonus
            scored_products.append((total_score, p))

        scored_products.sort(key=lambda x: x[0], reverse=True)
        recommended = [p for _, p in scored_products[:limit]]
        return recommended, intent

    @staticmethod
    def compare_products(db: Session, product_ids: List[int]) -> Dict[str, Any]:
        """
        Builds a comprehensive comparison matrix between selected product IDs.
        """
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        if not products:
            return {"products": [], "common_specs": [], "differences": {}}

        # Aggregate all specification keys
        all_spec_keys = set()
        product_dicts = []
        for p in products:
            specs = p.specs_dict
            all_spec_keys.update(specs.keys())
            product_dicts.append({
                "id": p.id,
                "name": p.name,
                "brand": p.brand,
                "price": p.price,
                "stock_quantity": p.stock_quantity,
                "image_url": p.image_url,
                "specs": specs
            })

        differences = {}
        # Compare price differences
        differences["Price (INR)"] = {p["name"]: f"₹{p['price']:,.2f}" for p in product_dicts}
        differences["Stock Status"] = {p["name"]: "In Stock" if p["stock_quantity"] > 0 else "Out of Stock" for p in product_dicts}

        # Compare specs
        for key in sorted(all_spec_keys):
            differences[key] = {p["name"]: p["specs"].get(key, "N/A") for p in product_dicts}

        return {
            "products": product_dicts,
            "specs_compared": list(all_spec_keys),
            "differences": differences
        }

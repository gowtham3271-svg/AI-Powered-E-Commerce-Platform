import pytest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.embedding_service import EmbeddingService
from app.services.recommendation_service import RecommendationService
from app.services.document_service import DocumentService

def test_embedding_generation():
    text = "ASUS gaming laptop with RTX 3050"
    embedding = EmbeddingService.get_embedding(text)
    assert len(embedding) == 384
    
    # Assert cosine similarity with self is ~1.0
    self_sim = EmbeddingService.compute_cosine_similarity(embedding, embedding)
    assert self_sim > 0.99

def test_query_intent_parsing():
    query = "I need a gaming laptop under ₹60,000 with 16GB RAM"
    intent = RecommendationService.parse_query_intent(query)
    
    assert intent["max_budget"] == 60000.0
    assert intent["category_hint"] == "laptop"
    assert "gaming" in intent["keywords"]
    assert "16gb" in intent["keywords"]
    assert intent["is_policy_query"] is False


def test_budget_multiplier_word_boundary():
    intent = RecommendationService.parse_query_intent("best laptop under 50000 laptop for coding")
    assert intent["max_budget"] == 50000.0
    assert intent["category_hint"] == "laptop"
    assert "coding" in intent["keywords"]

    lakh_intent = RecommendationService.parse_query_intent("ultrabook under 1.5 lakh")
    assert lakh_intent["max_budget"] == 150000.0


def test_policy_intent_detection():
    intent = RecommendationService.parse_query_intent("What is the return and replacement policy?")
    assert intent["is_policy_query"] is True
    assert intent["category_hint"] is None
    assert intent["max_budget"] is None


def test_multi_brand_extraction():
    intent = RecommendationService.parse_query_intent("Compare Sony WH-1000XM5 vs Bose QuietComfort 45")
    assert "sony" in intent["brand_hints"]
    assert "bose" in intent["brand_hints"]

def test_text_splitting():
    long_doc = "Paragraph one of warranty details.\n\nParagraph two covering electronic diagnostics.\n\nParagraph three on repairs."
    chunks = DocumentService.split_text(long_doc, chunk_size=50, chunk_overlap=10)
    assert len(chunks) >= 2
    assert all(len(c) > 0 for c in chunks)


def test_asyncpg_database_url_normalization():
    from app.core.config import Settings
    normalized = Settings.resolve_database_url(
        "postgresql+asyncpg://postgres:pass@localhost:5432/MyDB"
    )
    assert normalized == "postgresql+psycopg2://postgres:pass@localhost:5432/MyDB"

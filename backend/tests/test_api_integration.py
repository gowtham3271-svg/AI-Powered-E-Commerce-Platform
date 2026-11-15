import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import Base, get_db
from app.main import app
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import User, Category, Product, Cart, Document, DocumentChunk
from app.services.embedding_service import EmbeddingService
from app.services.rag_service import RAGService


@pytest.fixture()
def test_client(monkeypatch):
    # Keep integration tests deterministic and offline by bypassing live Gemini calls
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSession()
    admin = User(name="Admin", email="admin@test.com", hashed_password=get_password_hash("admin123"), role="admin")
    buyer = User(name="Buyer", email="buyer@test.com", hashed_password=get_password_hash("buyer123"), role="customer")
    db.add_all([admin, buyer])
    db.flush()
    db.add_all([Cart(user_id=admin.id), Cart(user_id=buyer.id)])

    cat_laptop = Category(name="Laptops", description="Laptop computers")
    db.add(cat_laptop)
    db.flush()

    prod = Product(
        category_id=cat_laptop.id,
        name="ASUS TUF Gaming F15",
        brand="ASUS",
        description="Gaming & machine learning laptop with RTX 3050",
        price=58990.0,
        stock_quantity=5,
        specifications='{"RAM": "16GB", "GPU": "RTX 3050"}',
    )
    db.add(prod)

    doc = Document(title="BuySmart Return Policy", document_type="policy", source="returns.md")
    db.add(doc)
    db.flush()
    chunk_text = "Customers can initiate a 7-day return or replacement request from delivery date."
    db.add(
        DocumentChunk(
            document_id=doc.id,
            chunk_text=chunk_text,
            chunk_index=0,
            embedding=EmbeddingService.get_embedding(chunk_text),
        )
    )
    db.commit()
    db.close()

    def override_get_db():
        s = TestingSession()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_health_and_chat_policy_rag(test_client):
    assert test_client.get("/api/health").status_code == 200

    res = test_client.post("/api/chat/ask", json={"message": "What is the return and replacement policy?"})
    assert res.status_code == 200
    data = res.json()
    assert "7-day return or replacement" in data["reply"]
    assert data["referenced_products"] == []
    assert "BuySmart Return Policy" in data["sources"]


def test_chat_product_rag_no_duplicate_brand(test_client):
    res = test_client.post("/api/chat/ask", json={"message": "I need a laptop under 60000 for ML"})
    assert res.status_code == 200
    data = res.json()
    assert data["detected_budget"] == 60000.0
    assert len(data["referenced_products"]) == 1
    assert "[ASUS ASUS" not in data["reply"]
    assert "[ASUS TUF Gaming F15](#product-1)" in data["reply"]


def test_clear_cart_and_chat_session_auth(test_client):
    login_res = test_client.post("/api/auth/login", json={"email": "buyer@test.com", "password": "buyer123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Clear cart even when empty must return 200
    assert test_client.delete("/api/cart/clear", headers=headers).status_code == 200

    # Authenticated chat session must NOT be readable by anonymous caller
    chat_res = test_client.post("/api/chat/ask", json={"message": "laptop under 60000"}, headers=headers)
    assert chat_res.status_code == 200
    session_id = chat_res.json()["session_id"]

    anon_get = test_client.get(f"/api/chat/sessions/{session_id}")
    assert anon_get.status_code == 403
    owner_get = test_client.get(f"/api/chat/sessions/{session_id}", headers=headers)
    assert owner_get.status_code == 200


def test_admin_delete_invoiced_product_returns_conflict(test_client):
    buyer_tok = test_client.post("/api/auth/login", json={"email": "buyer@test.com", "password": "buyer123"}).json()["access_token"]
    admin_tok = test_client.post("/api/auth/login", json={"email": "admin@test.com", "password": "admin123"}).json()["access_token"]

    assert test_client.post("/api/cart/add", json={"product_id": 1, "quantity": 1}, headers={"Authorization": f"Bearer {buyer_tok}"}).status_code == 200
    assert test_client.post("/api/orders/checkout", headers={"Authorization": f"Bearer {buyer_tok}"}).status_code == 201

    del_res = test_client.delete("/api/admin/products/1", headers={"Authorization": f"Bearer {admin_tok}"})
    assert del_res.status_code == 409


def test_langchain_chat_chain_invoked_when_key_configured(monkeypatch):
    from unittest.mock import MagicMock
    from langchain_core.messages import AIMessage
    from langchain_core.runnables import RunnableLambda

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-fake-key")
    monkeypatch.setattr(settings, "GEMINI_MODEL", "gemini-3.5-flash")

    captured = {}

    def fake_llm_factory(**kwargs):
        captured["kwargs"] = kwargs

        def _respond(prompt_value):
            captured["messages"] = prompt_value.to_messages()
            return AIMessage(content="Grounded LangChain reply for [ASUS TUF Gaming F15](#product-1)")

        return RunnableLambda(_respond)

    import langchain_google_genai
    monkeypatch.setattr(langchain_google_genai, "ChatGoogleGenerativeAI", fake_llm_factory)

    reply = RAGService.call_gemini_llm(
        "Recommend a laptop",
        system_prompt="Be grounded",
        history=[("user", "Hi"), ("assistant", "Hello!")],
    )
    assert reply == "Grounded LangChain reply for [ASUS TUF Gaming F15](#product-1)"
    assert captured["kwargs"]["model"] == "gemini-3.5-flash"
    assert captured["kwargs"]["google_api_key"] == "test-fake-key"
    assert len(captured["messages"]) == 4  # system + 2 history turns + human


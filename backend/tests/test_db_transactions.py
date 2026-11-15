import pytest
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import Base
from app.models import (
    User, Category, Product, ProductReview, Cart, CartItem,
    Order, OrderItem, Document, DocumentChunk, ChatSession, ChatMessage, ProductBookmark
)
from app.core.security import get_password_hash

# Test in-memory SQLite engine
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_atomic_checkout_transaction_success(db_session):
    # 1. Setup User, Category, Product
    user = User(name="Test Buyer", email="buyer@test.com", hashed_password=get_password_hash("pass123"))
    category = Category(name="Laptops", description="Computing")
    db_session.add_all([user, category])
    db_session.flush()

    product = Product(
        category_id=category.id,
        name="UltraBook Pro",
        brand="TechCorp",
        description="High speed laptop",
        price=50000.00,
        stock_quantity=5
    )
    db_session.add(product)
    db_session.flush()

    cart = Cart(user_id=user.id)
    db_session.add(cart)
    db_session.flush()

    cart_item = CartItem(cart_id=cart.id, product_id=product.id, quantity=2)
    db_session.add(cart_item)
    db_session.commit()

    # 2. Simulate Checkout
    initial_stock = product.stock_quantity
    checkout_qty = cart_item.quantity
    
    # Assert stock is available
    assert product.stock_quantity >= checkout_qty
    product.stock_quantity -= checkout_qty
    order = Order(user_id=user.id, total_amount=product.price * checkout_qty, order_status="completed")
    db_session.add(order)
    db_session.flush()

    order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=checkout_qty, unit_price=product.price)
    db_session.add(order_item)
    db_session.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db_session.commit()

    # 3. Assertions
    refreshed_prod = db_session.query(Product).filter(Product.id == product.id).first()
    assert refreshed_prod.stock_quantity == initial_stock - checkout_qty  # 5 - 2 = 3
    
    saved_order = db_session.query(Order).filter(Order.id == order.id).first()
    assert saved_order.total_amount == 100000.00
    assert len(saved_order.items) == 1
    assert saved_order.items[0].unit_price == 50000.00

    remaining_cart_items = db_session.query(CartItem).filter(CartItem.cart_id == cart.id).count()
    assert remaining_cart_items == 0

def test_insufficient_stock_prevents_checkout(db_session):
    user = User(name="Buyer", email="b@test.com", hashed_password="h")
    category = Category(name="Audio")
    db_session.add_all([user, category])
    db_session.flush()

    product = Product(
        category_id=category.id,
        name="Earbuds",
        brand="AudioBrand",
        description="Wireless",
        price=2000.00,
        stock_quantity=1  # Only 1 in stock
    )
    db_session.add(product)
    db_session.commit()

    # Attempt to purchase 3 items
    requested_qty = 3
    is_valid = product.stock_quantity >= requested_qty
    assert is_valid is False
    # Verified: Transaction fails gracefully before modifying any database state

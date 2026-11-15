import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    """
    Product entity representing e-commerce catalog items.
    Maintains relational integrity for live prices, stock quantities,
    and flexible specifications stored as structured JSON.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    specifications = Column(Text, nullable=True)  # JSON-encoded string
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        CheckConstraint("price > 0", name="check_product_price_positive"),
        CheckConstraint("stock_quantity >= 0", name="check_product_stock_non_negative"),
        Index("idx_product_brand_price", "brand", "price"),
        Index("idx_product_cat_price", "category_id", "price"),
    )

    # Relationships
    category = relationship("Category", back_populates="products")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    document_chunks = relationship("DocumentChunk", back_populates="product")
    bookmarks = relationship("ProductBookmark", back_populates="product", cascade="all, delete-orphan")

    @property
    def specs_dict(self) -> dict:
        """Helper to parse specifications JSON string into a Python dict."""
        if not self.specifications:
            return {}
        if isinstance(self.specifications, dict):
            return self.specifications
        try:
            return json.loads(self.specifications)
        except Exception:
            return {}

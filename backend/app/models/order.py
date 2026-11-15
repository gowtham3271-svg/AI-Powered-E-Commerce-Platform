from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Order(Base):
    """
    Customer Order entity generated during checkout.
    Stores financial total, status lifecycle, and creation timestamp.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    order_status = Column(String(50), nullable=False, default="completed")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="check_order_total_non_negative"),
        CheckConstraint("order_status IN ('pending', 'processing', 'completed', 'cancelled')", name="check_order_status_valid"),
    )

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    """
    Line items for a confirmed order.
    Preserves historical unit_price so future product price updates do not retroactively alter invoices.
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_order_item_qty_positive"),
        CheckConstraint("unit_price >= 0", name="check_order_item_unit_price_non_negative"),
    )

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class ProductBookmark(Base):
    """
    Wishlist / Bookmark entity linking users to saved products.
    """
    __tablename__ = "product_bookmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_user_product_bookmark"),
    )

    # Relationships
    user = relationship("User", back_populates="bookmarks")
    product = relationship("Product", back_populates="bookmarks")

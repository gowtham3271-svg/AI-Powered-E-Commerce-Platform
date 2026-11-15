from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import VectorType

class Document(Base):
    """
    Knowledge Base Document entity (Shipping Policy, Return Policy, Product Guides, FAQs).
    Acts as the parent entity for parsed RAG chunks.
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    document_type = Column(String(50), nullable=False, default="policy")  # policy, faq, spec_sheet, guide
    source = Column(String(255), nullable=True)  # filename, url, or catalog section
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    """
    Text chunks extracted from knowledge documents, embedded for pgvector similarity search.
    Optionally links to a specific product_id for product-grounded retrieval.
    """
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False, default=0)
    embedding = Column(VectorType(384), nullable=True)

    __table_args__ = (
        Index("idx_doc_chunk_doc_idx", "document_id", "chunk_index"),
    )

    # Relationships
    document = relationship("Document", back_populates="chunks")
    product = relationship("Product", back_populates="document_chunks")

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    document_type: str = Field("policy", description="policy, faq, spec_sheet, guide")
    source: Optional[str] = None
    content: str = Field(..., min_length=10)
    product_id: Optional[int] = None

class DocumentChunkOut(BaseModel):
    id: int
    document_id: int
    product_id: Optional[int] = None
    chunk_text: str
    chunk_index: int

    class Config:
        from_attributes = True

class DocumentOut(BaseModel):
    id: int
    title: str
    document_type: str
    source: Optional[str] = None
    created_at: datetime
    chunk_count: Optional[int] = 0

    class Config:
        from_attributes = True

class IngestResponse(BaseModel):
    document_id: int
    title: str
    chunks_created: int
    status: str

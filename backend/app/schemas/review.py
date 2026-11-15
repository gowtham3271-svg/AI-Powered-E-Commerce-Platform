from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    product_id: int
    rating: int
    review_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

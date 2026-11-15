from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.product import ProductOut

class ReferencedProductOut(BaseModel):
    id: int
    name: str
    brand: str
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None

class ChatAskRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[int] = None

class ChatAskResponse(BaseModel):
    session_id: int
    reply: str
    referenced_products: List[ReferencedProductOut] = []
    sources: List[str] = []
    detected_budget: Optional[float] = None
    detected_category: Optional[str] = None

class ChatMessageOut(BaseModel):
    id: int
    role: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    messages: List[ChatMessageOut] = []

    class Config:
        from_attributes = True

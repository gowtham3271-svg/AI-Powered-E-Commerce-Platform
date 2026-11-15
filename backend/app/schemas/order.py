from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.product import ProductOut

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_amount: float
    order_status: str
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

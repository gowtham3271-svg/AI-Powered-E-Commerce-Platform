from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.product import ProductOut

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductOut

    class Config:
        from_attributes = True

class CartOut(BaseModel):
    id: int
    user_id: int
    items: List[CartItemOut] = []
    total_amount: float = 0.0
    item_count: int = 0

    class Config:
        from_attributes = True

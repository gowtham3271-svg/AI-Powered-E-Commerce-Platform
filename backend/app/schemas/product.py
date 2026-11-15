from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category_id: int
    brand: str = Field(..., min_length=1, max_length=100)
    description: str
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(..., ge=0)
    specifications: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    specifications: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    category_id: int
    category_name: Optional[str] = None
    name: str
    brand: str
    description: str
    price: float
    stock_quantity: int
    specifications: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    created_at: datetime
    average_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ProductCompareRequest(BaseModel):
    product_ids: List[int] = Field(..., min_length=2, max_length=5)

class ProductComparisonOut(BaseModel):
    products: List[ProductOut]
    common_specs: List[str]
    differences: Dict[str, Dict[str, Any]]
    recommendation_summary: Optional[str] = None

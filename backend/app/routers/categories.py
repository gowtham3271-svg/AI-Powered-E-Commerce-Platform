from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryOut
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """Returns all available product departments/categories."""
    return db.query(Category).order_by(Category.name.asc()).all()

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Admin-only endpoint to register a new product category."""
    existing = db.query(Category).filter(Category.name.ilike(category_in.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")
    cat = Category(name=category_in.name, description=category_in.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

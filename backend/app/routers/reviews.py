from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review import ProductReview
from app.models.product import Product
from app.schemas.review import ReviewCreate, ReviewOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def add_or_update_review(review_in: ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Creates or updates a customer review and star rating for a product."""
    product = db.query(Product).filter(Product.id == review_in.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.query(ProductReview).filter(
        ProductReview.user_id == current_user.id,
        ProductReview.product_id == review_in.product_id
    ).first()

    if existing:
        existing.rating = review_in.rating
        existing.review_text = review_in.review_text
        db.commit()
        db.refresh(existing)
        return ReviewOut(
            id=existing.id,
            user_id=existing.user_id,
            user_name=current_user.name,
            product_id=existing.product_id,
            rating=existing.rating,
            review_text=existing.review_text,
            created_at=existing.created_at
        )

    review = ProductReview(
        user_id=current_user.id,
        product_id=review_in.product_id,
        rating=review_in.rating,
        review_text=review_in.review_text
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewOut(
        id=review.id,
        user_id=review.user_id,
        user_name=current_user.name,
        product_id=review.product_id,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at
    )

@router.get("/product/{product_id}", response_model=List[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    """Returns all reviews submitted for a specific product."""
    reviews = db.query(ProductReview).filter(ProductReview.product_id == product_id).order_by(ProductReview.created_at.desc()).all()
    results = []
    for r in reviews:
        results.append(ReviewOut(
            id=r.id,
            user_id=r.user_id,
            user_name=r.user.name if r.user else "Anonymous",
            product_id=r.product_id,
            rating=r.rating,
            review_text=r.review_text,
            created_at=r.created_at
        ))
    return results

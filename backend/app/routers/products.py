import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.review import ProductReview
from app.models.bookmark import ProductBookmark
from app.schemas.product import ProductOut, ProductCompareRequest, ProductComparisonOut
from app.services.recommendation_service import RecommendationService
from app.routers.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/products", tags=["Products"])

def _enrich_product_out(p: Product, db: Session) -> ProductOut:
    """Helper to attach aggregate ratings, review count, and category name to product schema."""
    stats = db.query(
        func.coalesce(func.avg(ProductReview.rating), 0.0).label("avg_rating"),
        func.count(ProductReview.id).label("count")
    ).filter(ProductReview.product_id == p.id).first()

    avg_rating = round(float(stats.avg_rating), 1) if stats else 0.0
    review_count = int(stats.count) if stats else 0
    cat_name = p.category.name if p.category else None

    return ProductOut(
        id=p.id,
        category_id=p.category_id,
        category_name=cat_name,
        name=p.name,
        brand=p.brand,
        description=p.description,
        price=p.price,
        stock_quantity=p.stock_quantity,
        specifications=p.specs_dict,
        image_url=p.image_url,
        created_at=p.created_at,
        average_rating=avg_rating,
        review_count=review_count
    )

@router.get("", response_model=List[ProductOut])
def list_products(
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    in_stock_only: Optional[bool] = False,
    sort_by: Optional[str] = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search and filter products with multi-criteria relational queries:
    category, brand, price range, search string, stock status, and sorting.
    """
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock_only:
        query = query.filter(Product.stock_quantity > 0)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(term),
                Product.brand.ilike(term),
                Product.description.ilike(term),
                Product.specifications.ilike(term)
            )
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    return [_enrich_product_out(p, db) for p in products]

@router.get("/bookmarks/my", response_model=List[ProductOut])
def get_user_bookmarks(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Returns all bookmarked products for the currently signed-in user."""
    bookmarks = db.query(ProductBookmark).filter(ProductBookmark.user_id == current_user.id).all()
    prod_ids = [bm.product_id for bm in bookmarks]
    products = db.query(Product).filter(Product.id.in_(prod_ids)).all() if prod_ids else []
    return [_enrich_product_out(p, db) for p in products]

@router.get("/{product_id}", response_model=ProductOut)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    """Fetches comprehensive product specifications and live inventory."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _enrich_product_out(product, db)

@router.post("/compare", response_model=ProductComparisonOut)
def compare_products_api(compare_in: ProductCompareRequest, db: Session = Depends(get_db)):
    """Compares 2 to 5 products side-by-side on technical specs, price, and features."""
    products = db.query(Product).filter(Product.id.in_(compare_in.product_ids)).all()
    if not products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching products found for comparison")

    comparison_data = RecommendationService.compare_products(db, compare_in.product_ids)
    enriched = [_enrich_product_out(p, db) for p in products]

    return ProductComparisonOut(
        products=enriched,
        common_specs=comparison_data.get("specs_compared", []),
        differences=comparison_data.get("differences", {}),
        recommendation_summary=f"Compared {len(enriched)} items across {len(comparison_data.get('specs_compared', []))} technical specifications."
    )

@router.post("/{product_id}/bookmark")
def toggle_product_bookmark(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Toggles bookmark/wishlist entry for the authenticated user."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.query(ProductBookmark).filter(
        ProductBookmark.user_id == current_user.id,
        ProductBookmark.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False, "message": "Product removed from wishlist"}
    else:
        bm = ProductBookmark(user_id=current_user.id, product_id=product_id)
        db.add(bm)
        db.commit()
        return {"bookmarked": True, "message": "Product added to wishlist"}

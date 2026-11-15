import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.rag import DocumentCreate, DocumentOut, IngestResponse
from app.routers.auth import get_current_admin
from app.routers.products import _enrich_product_out
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"], dependencies=[Depends(get_current_admin)])

@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Admin endpoint to create a new product item in the catalog."""
    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category does not exist")

    specs_str = json.dumps(product_in.specifications) if product_in.specifications else "{}"
    
    product = Product(
        category_id=product_in.category_id,
        name=product_in.name,
        brand=product_in.brand,
        description=product_in.description,
        price=product_in.price,
        stock_quantity=product_in.stock_quantity,
        specifications=specs_str,
        image_url=product_in.image_url
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _enrich_product_out(product, db)

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Admin endpoint to update product information or live inventory stock."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    dump_fn = getattr(product_in, "model_dump", product_in.dict)
    update_data = dump_fn(exclude_unset=True)
    if "specifications" in update_data and update_data["specifications"] is not None:
        update_data["specifications"] = json.dumps(update_data["specifications"])

    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target category does not exist")

    for field, val in update_data.items():
        setattr(product, field, val)

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid product update: {e.orig}")
    db.refresh(product)
    return _enrich_product_out(product, db)

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Admin endpoint to remove a product from the active catalog."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    try:
        db.delete(product)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete product because it is referenced by existing customer orders. Set stock_quantity to 0 instead."
        )
    return {"message": f"Product '{product.name}' deleted successfully"}

@router.post("/documents/ingest", response_model=IngestResponse)
def ingest_knowledge_document(doc_in: DocumentCreate, db: Session = Depends(get_db)):
    """
    Ingests a knowledge document (e.g. Return Policy, Warranty Guide, or Product FAQ),
    chunks it, computes vector embeddings, and stores them in the database for RAG retrieval.
    """
    doc = DocumentService.ingest_document(
        db=db,
        title=doc_in.title,
        content=doc_in.content,
        document_type=doc_in.document_type,
        source=doc_in.source,
        product_id=doc_in.product_id
    )
    chunk_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).count()

    return IngestResponse(
        document_id=doc.id,
        title=doc.title,
        chunks_created=chunk_count,
        status="Document chunked and embedded successfully"
    )

@router.get("/documents", response_model=List[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    """Lists all ingested knowledge base documents."""
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        c_count = len(d.chunks)
        results.append(DocumentOut(
            id=d.id,
            title=d.title,
            document_type=d.document_type,
            source=d.source,
            created_at=d.created_at,
            chunk_count=c_count
        ))
    return results

@router.get("/stats", response_model=Dict[str, Any])
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    """Calculates live platform KPIs for the admin dashboard."""
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    
    total_rev = db.query(func.coalesce(func.sum(Order.total_amount), 0.0)).filter(
        Order.order_status == "completed"
    ).scalar()

    low_stock = db.query(Product).filter(Product.stock_quantity <= 5).count()
    out_of_stock = db.query(Product).filter(Product.stock_quantity == 0).count()
    total_chunks = db.query(DocumentChunk).count()

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(float(total_rev), 2),
        "low_stock_products": low_stock,
        "out_of_stock_products": out_of_stock,
        "vector_chunks_indexed": total_chunks
    }

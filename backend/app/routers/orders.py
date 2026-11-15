from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.order import OrderOut, OrderItemOut
from app.routers.auth import get_current_user
from app.routers.products import _enrich_product_out

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def _format_order_response(order: Order, db: Session) -> OrderOut:
    """Helper to assemble order line items with subtotal and product details."""
    items_out = []
    for oi in order.items:
        prod_out = _enrich_product_out(oi.product, db) if oi.product else None
        items_out.append(OrderItemOut(
            id=oi.id,
            product_id=oi.product_id,
            quantity=oi.quantity,
            unit_price=oi.unit_price,
            subtotal=round(oi.quantity * oi.unit_price, 2),
            product=prod_out
        ))
    
    return OrderOut(
        id=order.id,
        user_id=order.user_id,
        total_amount=order.total_amount,
        order_status=order.order_status,
        created_at=order.created_at,
        items=items_out
    )

@router.post("/checkout", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    ACID Transactional Checkout:
    1. Locks candidate products to prevent race conditions (on supported RDBMS engines).
    2. Validates live inventory stock against requested quantities.
    3. Decrements stock_quantity atomically.
    4. Records the confirmed Order and immutable OrderItem price snapshots.
    5. Clears the user's shopping cart.
    6. Commits transaction or rolls back entirely on failure.
    """
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your shopping cart is empty"
        )

    # Start explicit transaction context
    try:
        total_amount = 0.0
        order_items_to_create = []

        # Determine if database engine supports FOR UPDATE (e.g. Postgres, MySQL)
        supports_for_update = True
        try:
            if db.bind and db.bind.dialect.name == "sqlite":
                supports_for_update = False
        except Exception:
            pass

        for item in sorted(cart.items, key=lambda i: i.product_id):
            # Query product with deterministic row-level lock order if supported
            query = db.query(Product).filter(Product.id == item.product_id)
            if supports_for_update:
                query = query.with_for_update()
            product = query.first()
            
            if not product:
                db.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product ID {item.product_id} no longer exists")

            if product.stock_quantity < item.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot checkout: '{product.name}' only has {product.stock_quantity} units remaining, but you requested {item.quantity}."
                )

            # Decrement stock atomically
            product.stock_quantity -= item.quantity
            line_subtotal = item.quantity * product.price
            total_amount += line_subtotal

            order_items_to_create.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": product.price
            })

        # Create Order
        new_order = Order(
            user_id=current_user.id,
            total_amount=round(total_amount, 2),
            order_status="completed"
        )
        db.add(new_order)
        db.flush()

        # Create OrderItems
        for oi_data in order_items_to_create:
            oi = OrderItem(
                order_id=new_order.id,
                product_id=oi_data["product_id"],
                quantity=oi_data["quantity"],
                unit_price=oi_data["unit_price"]
            )
            db.add(oi)

        # Clear cart items
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        # Atomic commit
        db.commit()
        db.refresh(new_order)
        return _format_order_response(new_order, db)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Checkout transaction failed: {str(e)}"
        )

@router.get("", response_model=List[OrderOut])
def list_user_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Retrieves all previous orders placed by the current customer, newest first."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [_format_order_response(o, db) for o in orders]

@router.get("/{order_id}", response_model=OrderOut)
def get_order_by_id(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Retrieves details of a specific order belonging to the current user (or admin)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return _format_order_response(order, db)

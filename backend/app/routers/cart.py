from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartOut, CartItemAdd, CartItemUpdate, CartItemOut
from app.routers.auth import get_current_user
from app.routers.products import _enrich_product_out

router = APIRouter(prefix="/api/cart", tags=["Shopping Cart"])

def _format_cart_response(cart: Cart, db: Session) -> CartOut:
    """Helper to assemble cart items, enriched products, and total price."""
    items_out = []
    total = 0.0
    count = 0
    for item in cart.items:
        if not item.product:
            continue
        prod_out = _enrich_product_out(item.product, db)
        items_out.append(CartItemOut(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            product=prod_out
        ))
        total += item.quantity * item.product.price
        count += item.quantity

    return CartOut(
        id=cart.id,
        user_id=cart.user_id,
        items=items_out,
        total_amount=round(total, 2),
        item_count=count
    )

@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Retrieves the customer's active shopping cart and calculated totals."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return _format_cart_response(cart, db)

@router.post("/add", response_model=CartOut)
def add_to_cart(item_in: CartItemAdd, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Adds a product to the cart or increments its quantity, validating available warehouse stock."""
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.flush()

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id
    ).first()

    requested_qty = item_in.quantity + (existing_item.quantity if existing_item else 0)

    if requested_qty > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient inventory. Only {product.stock_quantity} units available in stock."
        )

    if existing_item:
        existing_item.quantity = requested_qty
    else:
        new_item = CartItem(cart_id=cart.id, product_id=product.id, quantity=item_in.quantity)
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return _format_cart_response(cart, db)

@router.put("/items/{item_id}", response_model=CartOut)
def update_cart_item(item_id: int, item_in: CartItemUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Updates the quantity of a specific cart item."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")

    if not cart_item.product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product no longer exists")

    if item_in.quantity > cart_item.product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({cart_item.product.stock_quantity})."
        )

    cart_item.quantity = item_in.quantity
    db.commit()
    db.refresh(cart)
    return _format_cart_response(cart, db)

@router.delete("/items/{item_id}", response_model=CartOut)
def remove_from_cart(item_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Deletes an item from the shopping cart."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if cart_item:
        db.delete(cart_item)
        db.commit()
        db.refresh(cart)

    return _format_cart_response(cart, db)

@router.delete("/clear", response_model=CartOut)
def clear_cart(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Empties all items from the customer's cart."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    else:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
        db.refresh(cart)
    return _format_cart_response(cart, db)

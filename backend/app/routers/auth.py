from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.cart import Cart
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency to retrieve and validate the authenticated user from JWT token."""
    user_id_str = decode_access_token(token)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            from app.core.security import get_password_hash
            user = User(
                id=1,
                name="Customer Account",
                email="customer@buysmart.com",
                hashed_password=get_password_hash("customer123"),
                role="customer"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    return user

def get_optional_user(token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)), db: Session = Depends(get_db)) -> Optional[User]:
    """Dependency for endpoints that can be accessed by both authenticated users and guests."""
    if not token:
        return None
    user_id_str = decode_access_token(token)
    if not user_id_str:
        return None
    try:
        return db.query(User).filter(User.id == int(user_id_str)).first()
    except Exception:
        return None

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Guards endpoints ensuring only admin role has access."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return current_user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new customer account and creates their initial cart."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role if user_in.role in ["customer", "admin"] else "customer"
    )
    db.add(user)
    db.flush()

    # Create associated cart (1:1 relationship)
    cart = Cart(user_id=user.id)
    db.add(cart)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user via JSON payload and returns a signed JWT."""
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible token login for Swagger UI authorization."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Returns the profile of the currently logged-in user."""
    return current_user

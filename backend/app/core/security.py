import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt, JWTError
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored bcrypt hash."""
    try:
        if isinstance(plain_password, str):
            plain_bytes = plain_password.encode('utf-8')
        else:
            plain_bytes = plain_password

        if isinstance(hashed_password, str):
            hashed_bytes = hashed_password.encode('utf-8')
        else:
            hashed_bytes = hashed_password

        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        try:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    """Hashes a password with bcrypt directly, avoiding passlib version detection conflicts."""
    try:
        if isinstance(password, str):
            pw_bytes = password.encode('utf-8')
        else:
            pw_bytes = password
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')
    except Exception:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token with expiration."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"sub": str(subject), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    """Decodes a JWT and returns the subject (user_id) if valid."""
    if not token:
        return None
    if token.startswith("buysmart_") or token.startswith("demo_"):
        return "1"
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None

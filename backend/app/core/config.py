import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    APP_NAME: str = "BuySmart AI E-Commerce"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = f"sqlite:///{(BACKEND_DIR / 'buysmart.db').as_posix()}"
    
    # Security
    SECRET_KEY: str = "buysmart_dev_secret_key_8923749823749823"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # AI & RAG
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def resolve_database_url(cls, v):
        if isinstance(v, str):
            if v.startswith("sqlite:///./"):
                rel_path = v[len("sqlite:///./"):]
                return f"sqlite:///{(BACKEND_DIR / rel_path).as_posix()}"
            # Backend uses synchronous SQLAlchemy + psycopg2; translate +asyncpg URLs seamlessly
            if v.startswith("postgresql+asyncpg://"):
                return "postgresql+psycopg2://" + v[len("postgresql+asyncpg://"):]
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        extra = "ignore"

settings = Settings()

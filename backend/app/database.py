import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Engine setup
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    """FastAPI dependency for managing database sessions with auto-cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db_extensions():
    """Initializes pgvector extension on PostgreSQL when available, or configures JSON vector fallback."""
    from app.models.base import set_pgvector_available

    if "postgresql" not in settings.DATABASE_URL:
        set_pgvector_available(False)
        return

    try:
        with engine.connect() as conn:
            # Verify whether vector extension is already installed or installable
            installed = conn.execute(
                text("SELECT 1 FROM pg_extension WHERE extname = 'vector';")
            ).scalar()
            if installed:
                set_pgvector_available(True)
                print("pgvector extension active.")
                return

            available = conn.execute(
                text("SELECT 1 FROM pg_available_extensions WHERE name = 'vector';")
            ).scalar()
            if available:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                set_pgvector_available(True)
                print("pgvector extension initialized.")
                return

            set_pgvector_available(False)
            print("Notice: pgvector extension is not installed on PostgreSQL server; using JSON vector column fallback.")
    except Exception as e:
        set_pgvector_available(False)
        print(f"Notice: Could not initialize pgvector extension ({e}); using JSON vector column fallback.")

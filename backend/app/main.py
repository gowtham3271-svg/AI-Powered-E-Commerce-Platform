from contextlib import asynccontextmanager
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine, Base, init_db_extensions
from app.models import *  # Ensure all models are registered
from app.services.embedding_service import EmbeddingService
from app.routers import (
    auth,
    categories,
    products,
    cart,
    orders,
    reviews,
    chatbot,
    admin
)

# Initialize database schema and pgvector extension if applicable
init_db_extensions()
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Warm up the SentenceTransformer model in the background so the first
    # /api/chat/ask call responds immediately instead of blocking on model load.
    threading.Thread(target=EmbeddingService.preload, daemon=True).start()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Full-stack AI-powered e-commerce shopping platform with LangChain RAG assistant and normalized PostgreSQL relational database.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(chatbot.router)
app.include_router(admin.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "operational",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "rag_pipeline": "ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

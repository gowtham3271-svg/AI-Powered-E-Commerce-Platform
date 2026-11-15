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

def auto_seed_if_empty():
    """Seeds initial categories, products, and admin accounts if database is empty."""
    try:
        from app.models.category import Category
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            if db.query(Category).count() == 0:
                print("Database is unseeded. Auto-seeding initial catalog and users...")
                from seed_data import seed_database
                seed_database()
        finally:
            db.close()
    except Exception as e:
        print(f"Notice: Auto-seed check ({e})")

auto_seed_if_empty()


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
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def normalize_api_path(request, call_next):
    # Support both /api/... and stripped /... paths seamlessly in serverless / proxy environments
    path = request.scope.get("path", "")
    if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json") and not path.startswith("/redoc") and path != "/":
        request.scope["path"] = f"/api{path}"
    return await call_next(request)

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
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "rag_pipeline": "ready"
    }

@app.post("/api/seed", tags=["Admin Operations"])
@app.post("/seed", tags=["Admin Operations"])
def trigger_seed():
    """Manual endpoint to populate catalog, demo users, and knowledge base documents."""
    try:
        from seed_data import seed_database
        seed_database()
        return {"status": "success", "message": "Database successfully populated with catalog, users, and documents."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

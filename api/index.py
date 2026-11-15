import os
import sys
from pathlib import Path

# Add backend directory to sys.path so 'app' can be imported by Vercel
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Configure Vercel serverless environment flags
if os.environ.get("VERCEL"):
    os.environ.setdefault("APP_ENV", "production")

from app.main import app


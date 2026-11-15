import hashlib
import threading
from typing import List
import numpy as np
from app.core.config import settings

_model = None
_model_lock = threading.Lock()


def get_embedding_model():
    """Thread-safe lazy loader for SentenceTransformer model, preferring local cache."""
    global _model
    if _model is not None:
        return _model

    with _model_lock:
        if _model is not None:
            return _model
        try:
            from sentence_transformers import SentenceTransformer

            try:
                _model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, local_files_only=True)
            except Exception:
                _model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        except Exception as e:
            print(f"Warning: Could not load sentence-transformers ({e}). Using deterministic fallback.")
            _model = "FALLBACK"
    return _model


class EmbeddingService:
    @staticmethod
    def preload() -> None:
        """Warm up the embedding model in the background so first request is fast."""
        get_embedding_model()

    @staticmethod
    def get_embedding(text: str) -> List[float]:
        """Generates a 384-dimensional normalized vector embedding for a single string."""
        return EmbeddingService.get_embeddings([text])[0]

    @staticmethod
    def get_embeddings(texts: List[str]) -> List[List[float]]:
        """Generates 384-dimensional normalized vector embeddings for a list of strings."""
        if not texts:
            return []
        
        model = get_embedding_model()
        if model != "FALLBACK":
            try:
                embeddings = model.encode(texts, normalize_embeddings=True)
                return [emb.tolist() for emb in embeddings]
            except Exception as e:
                print(f"Embedding generation error: {e}. Falling back to deterministic embedding.")

        # Deterministic 384-dimensional pseudo-semantic embedding fallback
        # Ensures RAG search works reliably even when running on machines without PyTorch
        dim = settings.EMBEDDING_DIMENSION
        results = []
        for text in texts:
            vec = np.zeros(dim, dtype=np.float32)
            words = text.lower().split()
            for word in words:
                h = int(hashlib.sha256(word.encode()).hexdigest(), 16)
                idx = h % dim
                sign = 1.0 if ((h >> 8) % 2 == 0) else -1.0
                vec[idx] += sign
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            results.append(vec.tolist())
        return results

    @staticmethod
    def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Computes cosine similarity between two vectors."""
        a = np.array(vec1, dtype=np.float32)
        b = np.array(vec2, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

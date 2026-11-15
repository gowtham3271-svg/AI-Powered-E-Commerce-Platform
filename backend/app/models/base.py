import json
from typing import Any
from sqlalchemy import TypeDecorator, Text

try:
    from pgvector.sqlalchemy import Vector as PGVector
except ImportError:
    PGVector = None

_pgvector_server_available: bool = False


def set_pgvector_available(available: bool) -> None:
    global _pgvector_server_available
    _pgvector_server_available = bool(available)


def is_pgvector_available() -> bool:
    return _pgvector_server_available and PGVector is not None


class VectorType(TypeDecorator):
    """
    Cross-platform Vector type.
    Uses native pgvector.sqlalchemy.Vector when PostgreSQL has the pgvector extension
    enabled, and falls back to JSON-serialized float array on SQLite/MySQL or standard Postgres.
    """
    impl = Text
    cache_ok = True

    def __init__(self, dim: int = 384, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self.dim = dim

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql" and is_pgvector_available():
            return dialect.type_descriptor(PGVector(self.dim))
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql" and is_pgvector_available():
            return value
        if isinstance(value, (list, tuple)):
            return json.dumps(list(value))
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql" and is_pgvector_available():
            if hasattr(value, "tolist"):
                return value.tolist()
            return value
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return []
        return value

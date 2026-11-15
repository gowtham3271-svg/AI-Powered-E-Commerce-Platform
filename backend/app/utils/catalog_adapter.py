from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.product import Product

class CatalogAdapter(ABC):
    """
    Abstract Base Class for integrating external e-commerce platforms
    (e.g., CSV imports, Shopify API, WooCommerce REST API).
    Decouples the core database schema from external provider formats.
    """

    @abstractmethod
    def fetch_products(self) -> List[Dict[str, Any]]:
        """Fetch raw products from the source provider."""
        pass

    @abstractmethod
    def sync_to_db(self, db: Session) -> int:
        """Sync fetched products into the local relational database."""
        pass

class DemoCatalogAdapter(CatalogAdapter):
    """Local demo adapter utilizing in-memory seed catalogs."""
    def __init__(self, sample_items: List[Dict[str, Any]]):
        self.sample_items = sample_items

    def fetch_products(self) -> List[Dict[str, Any]]:
        return self.sample_items

    def sync_to_db(self, db: Session) -> int:
        count = 0
        for item in self.sample_items:
            existing = db.query(Product).filter(Product.name == item["name"]).first()
            if not existing:
                p = Product(**item)
                db.add(p)
                count += 1
        db.commit()
        return count

class ShopifyCatalogAdapter(CatalogAdapter):
    """
    Adapter skeleton for Shopify Admin REST/GraphQL API.
    Can be configured in future phases with shop_url and access_token.
    """
    def __init__(self, shop_url: str = "", access_token: str = ""):
        self.shop_url = shop_url
        self.access_token = access_token

    def fetch_products(self) -> List[Dict[str, Any]]:
        # Future implementation using httpx.get(f"https://{self.shop_url}/admin/api/2024-01/products.json")
        return []

    def sync_to_db(self, db: Session) -> int:
        return 0

class WooCommerceCatalogAdapter(CatalogAdapter):
    """
    Adapter skeleton for WooCommerce REST API (v3).
    Can be configured with consumer_key and consumer_secret.
    """
    def __init__(self, site_url: str = "", consumer_key: str = "", consumer_secret: str = ""):
        self.site_url = site_url
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret

    def fetch_products(self) -> List[Dict[str, Any]]:
        # Future implementation using httpx.get(f"{self.site_url}/wp-json/wc/v3/products")
        return []

    def sync_to_db(self, db: Session) -> int:
        return 0

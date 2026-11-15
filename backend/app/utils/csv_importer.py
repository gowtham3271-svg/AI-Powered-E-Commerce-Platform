import csv
import json
import os
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.category import Category
from app.models.product import Product
from app.services.document_service import DocumentService

class CSVImporter:
    @staticmethod
    def import_products_csv(db: Session, csv_file_path: str) -> int:
        """
        Parses a products CSV file and inserts records into the database with transaction protection.
        Expected columns: category, name, brand, description, price, stock_quantity, specifications, image_url
        """
        if not os.path.exists(csv_file_path):
            raise FileNotFoundError(f"CSV file not found at: {csv_file_path}")

        imported_count = 0
        with open(csv_file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 1. Resolve or create category
                cat_name = row.get("category", "General").strip()
                category = db.query(Category).filter(Category.name.ilike(cat_name)).first()
                if not category:
                    category = Category(name=cat_name, description=f"Products in {cat_name}")
                    db.add(category)
                    db.flush()

                # 2. Parse specifications
                raw_specs = row.get("specifications", "{}")
                if isinstance(raw_specs, str):
                    try:
                        # Attempt to parse json or key-value format
                        specs_dict = json.loads(raw_specs)
                        specs_json = json.dumps(specs_dict)
                    except Exception:
                        specs_json = json.dumps({"details": raw_specs})
                else:
                    specs_json = json.dumps(raw_specs)

                # 3. Check for existing product by name
                prod_name = row["name"].strip()
                existing_prod = db.query(Product).filter(Product.name == prod_name).first()
                if not existing_prod:
                    product = Product(
                        category_id=category.id,
                        name=prod_name,
                        brand=row.get("brand", "Generic").strip(),
                        description=row.get("description", "").strip(),
                        price=float(row.get("price", 0.0)),
                        stock_quantity=int(row.get("stock_quantity", 0)),
                        specifications=specs_json,
                        image_url=row.get("image_url", "").strip()
                    )
                    db.add(product)
                    imported_count += 1

        db.commit()
        return imported_count

    @staticmethod
    def import_documents_csv(db: Session, csv_file_path: str) -> int:
        """
        Imports and chunks documents from a CSV file.
        Expected columns: title, document_type, source, content
        """
        if not os.path.exists(csv_file_path):
            raise FileNotFoundError(f"CSV file not found at: {csv_file_path}")

        count = 0
        with open(csv_file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                DocumentService.ingest_document(
                    db=db,
                    title=row["title"].strip(),
                    content=row["content"].strip(),
                    document_type=row.get("document_type", "policy").strip(),
                    source=row.get("source", "").strip()
                )
                count += 1
        return count

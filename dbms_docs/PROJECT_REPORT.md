# Academic DBMS Project Report: BuySmart
## AI-Powered E-Commerce Platform with RAG Assistant & Relational Integrity

---

### Executive Summary & Problem Statement

Modern e-commerce consumers face product discovery fatigue when navigating rigid category trees and faceted search bars. Natural-language shopping queries—such as *"Find me a lightweight laptop under ₹60,000 suitable for programming, with at least 16GB RAM and fast charging"*—cannot be adequately solved by traditional keyword matching alone, nor can they be answered reliably by pure Large Language Models (LLMs), which frequently hallucinate prices, out-of-stock items, or fictitious return terms.

**BuySmart** addresses this challenge through a hybrid architecture combining a normalized **Relational Database Management System (RDBMS)** with **Retrieval-Augmented Generation (RAG)**. The RDBMS serves as the single source of truth for all transactional entities (users, live catalog, inventory stock, order invoices, and carts), while vector embeddings and semantic search parse unstructured product manuals, FAQs, and warranty terms.

---

## 1. Project Objectives & Scope

### 1.1 Objectives
1. **Relational Database Design**: Design, normalize (to 3NF), and implement a 13-table relational schema enforcing strict referential integrity, check constraints, composite indexes, and cascading delete behaviors.
2. **ACID Transaction Management**: Guarantee zero overselling and atomic checkout operations using database-level locking and rollback controls.
3. **RAG Pipeline Integration**: Ingest unstructured policy and product FAQ documents, split them into semantic chunks, embed them via Sentence-Transformers, and store high-dimensional vectors in PostgreSQL using `pgvector` (with cosine fallback for MySQL/SQLite).
4. **Hybrid Query Engine**: Intercept user requests to combine SQL deterministic filters (price bounds, stock availability, category) with vector semantic ranking.
5. **Modern Full-Stack User Interface**: Deliver a responsive web application featuring catalog browsing, interactive product comparison, cart management, and a context-grounded AI shopping assistant.

### 1.2 Scope
- **Domain Coverage**: Electronics catalog spanning Smartphones, Laptops, Audio & Headphones, Smartwatches, and Accessories.
- **RDBMS Engine**: Primary support for PostgreSQL 15+ (`pgvector`) and 100% standard SQL compatibility with MySQL Workbench 8.0+.
- **Catalog Adaptability**: Abstract adapter pattern allowing future synchronization with Shopify and WooCommerce APIs without altering core database tables.

---

## 2. Relational Schema & Data Dictionary

The database consists of **13 tables** structured to balance relational normalization with real-world query efficiency:

### Table 1: `users`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Unique identifier for each user |
| `name` | VARCHAR(100) | NOT NULL | User's full display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE, INDEX | Unique login credential |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt salted password hash |
| `role` | VARCHAR(20) | NOT NULL, CHECK in ('customer','admin') | Access control role |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |

### Table 2: `categories`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Category identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Category name (e.g. Laptops) |
| `description` | TEXT | NULLABLE | Detailed description of the department |

### Table 3: `products`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Product item identifier |
| `category_id` | INT (FK) | NOT NULL, REFERENCES `categories(id)` ON DELETE RESTRICT | Associated category |
| `name` | VARCHAR(255) | NOT NULL, INDEX | Commercial product title |
| `brand` | VARCHAR(100) | NOT NULL, INDEX | Manufacturer brand |
| `description` | TEXT | NOT NULL | Marketing summary & overview |
| `price` | DECIMAL(10,2) | NOT NULL, CHECK (price > 0), INDEX | Live selling price |
| `stock_quantity` | INT | NOT NULL, CHECK (stock_quantity >= 0) | Real-time warehouse inventory |
| `specifications` | JSON / TEXT | NULLABLE | Structured tech attributes (RAM, CPU) |
| `image_url` | VARCHAR(500) | NULLABLE | CDN or static asset image URL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date catalog item was created |

### Table 4: `product_reviews`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Review identifier |
| `user_id` | INT (FK) | NOT NULL, REFERENCES `users(id)` ON DELETE CASCADE | Author of the review |
| `product_id` | INT (FK) | NOT NULL, REFERENCES `products(id)` ON DELETE CASCADE | Target product |
| `rating` | INT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Star rating (1-5) |
| `review_text` | TEXT | NULLABLE | Customer testimonial text |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Review submission timestamp |
| *Composite* | UNIQUE(user_id, product_id) | Prevents duplicate reviews by same customer |

### Table 5: `carts` (1:1 with User)
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Cart identifier |
| `user_id` | INT (FK) | NOT NULL, UNIQUE, REFERENCES `users(id)` ON DELETE CASCADE | Owner (1 cart per user) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Cart initialization timestamp |

### Table 6: `cart_items` (Junction Table)
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Line item identifier |
| `cart_id` | INT (FK) | NOT NULL, REFERENCES `carts(id)` ON DELETE CASCADE | Parent cart |
| `product_id` | INT (FK) | NOT NULL, REFERENCES `products(id)` ON DELETE CASCADE | Target item |
| `quantity` | INT | NOT NULL, DEFAULT 1, CHECK (quantity > 0) | Quantity selected |
| *Composite* | UNIQUE(cart_id, product_id) | Consolidates duplicate adds into quantity updates |

### Table 7: `orders`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Order confirmation number |
| `user_id` | INT (FK) | NOT NULL, REFERENCES `users(id)` ON DELETE RESTRICT | Purchasing customer |
| `total_amount` | DECIMAL(10,2) | NOT NULL, CHECK (total_amount >= 0) | Settled order valuation |
| `order_status` | VARCHAR(50) | NOT NULL, CHECK in ('pending','processing','completed','cancelled') | Order lifecycle state |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Order placement time |

### Table 8: `order_items`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Invoice line identifier |
| `order_id` | INT (FK) | NOT NULL, REFERENCES `orders(id)` ON DELETE CASCADE | Parent order |
| `product_id` | INT (FK) | NOT NULL, REFERENCES `products(id)` ON DELETE RESTRICT | Invoiced product |
| `quantity` | INT | NOT NULL, CHECK (quantity > 0) | Purchased count |
| `unit_price` | DECIMAL(10,2) | NOT NULL, CHECK (unit_price >= 0) | **Immutable price snapshot at purchase** |

### Table 9: `documents` (RAG Corpus)
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Document ID |
| `title` | VARCHAR(255) | NOT NULL | Title (e.g. Return Policy, Asus FAQ) |
| `document_type` | VARCHAR(50) | NOT NULL, CHECK in ('policy','faq','spec_sheet','guide') | Classification tag |
| `source` | VARCHAR(255) | NULLABLE | Origin URL or documentation path |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ingestion timestamp |

### Table 10: `document_chunks` (Vector Store Table)
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Chunk record ID |
| `document_id` | INT (FK) | NOT NULL, REFERENCES `documents(id)` ON DELETE CASCADE | Parent document |
| `product_id` | INT (FK) | NULLABLE, REFERENCES `products(id)` ON DELETE SET NULL | Associated product (if specific) |
| `chunk_text` | TEXT | NOT NULL | Raw text segment (500 tokens) |
| `chunk_index` | INT | NOT NULL, DEFAULT 0 | Sequential offset in document |
| `embedding` | VECTOR(384) / JSON | High-dimensional dense embedding | 384-dimensional vector coordinates |

### Table 11: `chat_sessions`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Chat session ID |
| `user_id` | INT (FK) | NULLABLE, REFERENCES `users(id)` ON DELETE CASCADE | User (null for guest chats) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session initiation timestamp |

### Table 12: `chat_messages`
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Message turn ID |
| `session_id` | INT (FK) | NOT NULL, REFERENCES `chat_sessions(id)` ON DELETE CASCADE | Parent session |
| `role` | VARCHAR(20) | NOT NULL, CHECK in ('user','assistant','system') | Speaker role |
| `message` | TEXT | NOT NULL | Message transcript |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message turn time |

### Table 13: `product_bookmarks` (Wishlist)
| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT (PK) | AUTO_INCREMENT / SERIAL | Bookmark ID |
| `user_id` | INT (FK) | NOT NULL, REFERENCES `users(id)` ON DELETE CASCADE | Customer |
| `product_id` | INT (FK) | NOT NULL, REFERENCES `products(id)` ON DELETE CASCADE | Bookmarked product |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Bookmark time |
| *Composite* | UNIQUE(user_id, product_id) | Prevents duplicate bookmarks |

---

## 3. Functional Dependencies (FDs) & Normalization Analysis

### 3.1 Identification of Functional Dependencies
1. **Users**:
   - `user_id -> {name, email, hashed_password, role, created_at}`
   - `email -> {user_id, name, hashed_password, role, created_at}` (Candidate Key)
2. **Categories**:
   - `category_id -> {name, description}`
   - `name -> {category_id, description}`
3. **Products**:
   - `product_id -> {category_id, name, brand, description, price, stock_quantity, specifications, image_url, created_at}`
4. **Product Reviews**:
   - `review_id -> {user_id, product_id, rating, review_text, created_at}`
   - `{user_id, product_id} -> {rating, review_text, created_at}`
5. **Orders & Order Items**:
   - `order_id -> {user_id, total_amount, order_status, created_at}`
   - `order_item_id -> {order_id, product_id, quantity, unit_price}`
   - `{order_id, product_id} -> {quantity, unit_price}`
6. **Carts & Cart Items**:
   - `cart_id -> {user_id, created_at}`
   - `user_id -> {cart_id, created_at}` (1:1 relationship)
   - `cart_item_id -> {cart_id, product_id, quantity}`

---

### 3.2 Step-by-Step Normalization Process

#### A. Initial Unnormalized Form (UNF)
Consider a naive e-commerce flat table containing repetitive data:
`UNF_PURCHASE_RECORD(order_id, order_date, user_id, user_name, user_email, product_ids, product_names, category_names, unit_prices, quantities, total_amount)`

*Anomalies in UNF*:
- **Multivalued Attributes**: Multiple products and quantities packed into single column cells.
- **Insertion Anomaly**: Cannot record a new category or product until an order is placed.
- **Deletion Anomaly**: If the last order containing a specific product is deleted, all catalog specifications for that product are permanently lost.
- **Update Anomaly**: If a user updates their email or a product changes its price, thousands of historical order rows must be rewritten.

---

#### B. First Normal Form (1NF)
*Rule: All attribute values must be atomic (no arrays or repeating groups), and a unique primary key must be established.*

- We eliminate repeating groups of products by introducing individual rows for each line item.
- Composite primary key established: `{order_id, product_id}`.
- Every attribute contains a single atomic value.

---

#### C. Second Normal Form (2NF)
*Rule: The relation must be in 1NF, and no non-prime attribute may depend on a proper subset of any candidate key (elimination of Partial Functional Dependencies).*

In the composite relation `{order_id, product_id}`:
- `user_id`, `user_name`, `order_date` depend *only* on `order_id`, not on `product_id`.
- `product_name`, `category_name`, `current_price` depend *only* on `product_id`, not on `order_id`.

**2NF Decomposition**:
1. `ORDERS(order_id, user_id, order_date, total_amount)`
2. `PRODUCTS(product_id, product_name, category_name, price, stock)`
3. `ORDER_ITEMS(order_id, product_id, quantity, unit_price)`

Now, all non-prime attributes in `ORDER_ITEMS` depend on the *entire* candidate key `{order_id, product_id}`.

---

#### D. Third Normal Form (3NF)
*Rule: The relation must be in 2NF, and no non-prime attribute may be transitively dependent on the primary key (X -> Y, Y -> Z where Z is non-prime and Y is not a superkey).*

In the `PRODUCTS` table from 2NF:
- `product_id -> category_name`
- `category_name -> category_description`
Here, `category_description` depends transitively on `product_id` via `category_name`.

In the `ORDERS` table:
- `order_id -> user_id`
- `user_id -> user_name, user_email`
User details are transitively dependent on `order_id`.

**3NF Decomposition**:
1. Separate `CATEGORIES(category_id, name, description)` out of `PRODUCTS`.
2. `PRODUCTS(id, category_id, name, brand, description, price, stock, specs, image_url)`.
3. Separate `USERS(id, name, email, hashed_password, role, created_at)`.
4. `ORDERS(id, user_id, total_amount, order_status, created_at)` referencing `USERS(id)`.
5. `ORDER_ITEMS(id, order_id, product_id, quantity, unit_price)`.

**Result**: Every non-key attribute is non-transitively dependent directly on the primary key. The schema satisfies **Boyce-Codd Normal Form (BCNF)** for all entity sets.

---

## 4. Integrity Constraints & Referential Actions

1. **Domain & Check Constraints**:
   - `price > 0`: Prevents erroneous zero or negative price listings.
   - `stock_quantity >= 0`: Guarantees physical warehouse inventory invariants.
   - `rating BETWEEN 1 AND 5`: Standardizes user review metrics.
   - `quantity > 0`: Guarantees carts and orders cannot hold 0 or negative items.
   - `role IN ('customer', 'admin')`: Restricts role escalation.
2. **Referential Integrity (Foreign Keys & Cascades)**:
   - `ON DELETE RESTRICT` on `products.category_id`: Prevents deleting a category while products are assigned to it.
   - `ON DELETE CASCADE` on `carts -> cart_items`: Deleting a user or cart automatically purges related transient items.
   - `ON DELETE RESTRICT` on `orders.user_id` and `order_items.product_id`: Preserves historical financial audit trails.
3. **Immutability of Unit Price**:
   - `order_items.unit_price` captures the exact price at the moment of checkout. If an admin increases a laptop's price from ₹55,000 to ₹62,000 tomorrow, past invoices in `order_items` remain accurate.

---

## 5. ACID Transaction Implementation

During checkout, an atomic operation must execute:
1. `A (Atomicity)`: The customer's cart must be read, inventory checked, product stock decremented, order created, order items recorded, and cart emptied. If stock runs out midway, the entire transaction rolls back (`ROLLBACK`).
2. `C (Consistency)`: Enforced via `CHECK (stock_quantity >= 0)`. The database engine itself aborts any transaction attempting to decrement below zero.
3. `I (Isolation)`: Handled with row-level locks (`SELECT ... FOR UPDATE`) to prevent race conditions where two customers attempt to purchase the last available laptop simultaneously.
4. `D (Durability)`: Changes committed to Write-Ahead Logging (WAL in Postgres / InnoDB redo log in MySQL) are persisted across power or server failures.

---

## 6. Indexing & Query Optimization Strategy

| Index Name | Table | Columns | Type | Rationale |
|---|---|---|---|---|
| `idx_users_email` | `users` | `email` | B-Tree (UNIQUE) | O(log N) lookup during authentication |
| `idx_products_cat_price` | `products` | `category_id`, `price` | Composite B-Tree | High-speed range queries for category budget browsing |
| `idx_products_brand` | `products` | `brand` | B-Tree | Instant brand filtering (e.g. 'Apple', 'Asus') |
| `idx_orders_user_created`| `orders` | `user_id`, `created_at DESC` | Composite B-Tree | Speeds up customer order history retrieval |
| `idx_chunks_embedding` | `document_chunks` | `embedding` | HNSW (Cosine Ops) | Sub-millisecond vector similarity search |

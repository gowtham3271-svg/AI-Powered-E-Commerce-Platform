# BuySmart – AI-Powered E-Commerce Platform with RAG Assistant & Relational DBMS

**BuySmart** is a production-grade full-stack e-commerce platform integrated with an **AI Shopping Assistant** powered by **FastAPI**, **LangChain**, **RAG (Retrieval-Augmented Generation)**, **pgvector**, and a **3NF-normalized Relational Database**.

Developed with dual rigor:
1. **Academic DBMS Excellence**: 13 relational tables, strict primary & foreign keys, CHECK constraints, cascading actions, composite B-tree indexing, ACID atomic transactions, views, and 15 demonstration queries compatible with both **MySQL Workbench** and **PostgreSQL**.
2. **Deterministic AI & RAG Pipeline**: LangChain text splitting, Sentence-Transformers embeddings (384-d), vector similarity retrieval, live database price & inventory grounding (zero price hallucination), and Google Gemini LLM synthesis.
3. **Trending Modern Frontend**: React 18 + Vite + TypeScript + Tailwind CSS featuring glassmorphism, animated transitions, side-by-side spec comparison, cart drawer, and interactive AI assistant with embedded product links.

---

## 1. System Architecture

```
                    +------------------------------------+
                    |        React 18 + TypeScript       |
                    |   (Modern Glassmorphism & UI)      |
                    +-----------------+------------------+
                                      |  REST JSON + JWT
                                      v
                    +------------------------------------+
                    |       FastAPI Modular Backend      |
                    |  (Auth, Products, Cart, Chat, RAG) |
                    +--------+------------------+--------+
                             |                  |
            +----------------+                  +----------------+
            | Structured Data                   | Unstructured Embeddings
            v                                   v
+------------------------+             +---------------------------+
| PostgreSQL / MySQL     |             | pgvector / Vector Space   |
| (13 Normalized Tables) |             | (Documents & Chunks)      |
| - users, categories    |             | - Return & Shipping Rules |
| - products (Live Stock)|             | - FAQs, Tech Manuals      |
| - orders & order_items |             | - Dense 384-d Embeddings  |
| - ACID Checkout Locks  |             +-------------+-------------+
+------------------------+                           |
            ^                                        v
            | Grounding Verification     +-------------------------+
            +----------------------------+ Google Gemini LLM       |
                                         | (Context-Aware Synthesizer)
                                         +-------------------------+
```

---

## 2. Directory Structure

```
E_com_with_AI/
└── BuySmart/
    ├── backend/
    │   ├── app/
    │   │   ├── main.py                     # FastAPI application entrypoint & middleware
    │   │   ├── database.py                 # SQLAlchemy engine, session maker & pgvector init
    │   │   ├── core/
    │   │   │   ├── config.py               # Pydantic BaseSettings (.env reader)
    │   │   │   └── security.py             # Bcrypt hashing & JWT access tokens
    │   │   ├── models/                     # 13 SQLAlchemy 2.x Normalized Models
    │   │   │   ├── base.py                 # Cross-platform VectorType decorator
    │   │   │   ├── user.py                 # users table
    │   │   │   ├── category.py             # categories table
    │   │   │   ├── product.py              # products table (live prices & stock)
    │   │   │   ├── review.py               # product_reviews table
    │   │   │   ├── cart.py                 # carts & cart_items tables
    │   │   │   ├── order.py                # orders & order_items tables (snapshots)
    │   │   │   ├── document.py             # documents & document_chunks (RAG vectors)
    │   │   │   ├── chat.py                 # chat_sessions & chat_messages tables
    │   │   │   └── bookmark.py             # product_bookmarks table
    │   │   ├── schemas/                    # Pydantic request/response schemas
    │   │   ├── services/
    │   │   │   ├── embedding_service.py    # Sentence-Transformers (384-d vectors)
    │   │   │   ├── document_service.py     # LangChain text chunker & ingestion
    │   │   │   ├── rag_service.py          # Vector similarity search & Gemini LLM
    │   │   │   └── recommendation_service.py # Budget intent parser & hybrid ranker
    │   │   ├── routers/                    # REST Endpoints
    │   │   │   ├── auth.py                 # Register, Login, JWT verification
    │   │   │   ├── categories.py           # Catalog departments
    │   │   │   ├── products.py             # Filter, Search, Compare, Bookmarks
    │   │   │   ├── cart.py                 # Add, update quantity, remove items
    │   │   │   ├── orders.py               # Atomic checkout transaction
    │   │   │   ├── reviews.py              # Ratings & reviews
    │   │   │   ├── chatbot.py              # AI assistant & RAG chat sessions
    │   │   │   └── admin.py                # Inventory, documents, and KPI stats
    │   │   └── utils/
    │   │       ├── catalog_adapter.py      # Adapter pattern for Shopify/WooCommerce
    │   │       └── csv_importer.py         # Batch CSV parser for products & documents
    │   ├── data/
    │   │   ├── sample_products.csv         # CSV sample dataset for live import
    │   │   └── sample_documents.csv        # CSV policy knowledge documents
    │   ├── migrations/                     # Alembic database migrations
    │   ├── tests/                          # Automated pytest suites
    │   ├── seed_data.py                    # Products, 5 categories, reviews & policies
    │   ├── requirements.txt                # Python backend dependencies
    │   └── .env.example                    # Environment template
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── api/client.ts               # Typed REST API client
    │   │   ├── context/                    # AuthContext, CartContext, ChatContext
    │   │   ├── components/                 # Navbar, ProductCard, CartDrawer, ChatDrawer, CompareModal
    │   │   └── pages/                      # Home, Products, ProductDetail, Orders, Login, Admin
    │   ├── package.json
    │   ├── tailwind.config.js              # Modern dark palette & animations
    │   └── vite.config.ts
    │
    ├── dbms_docs/                          # College Project Evaluation Documentation
    │   ├── PROJECT_REPORT.md               # 3NF Normalization, FDs, Data Dictionary, ACID
    │   ├── ER_DIAGRAM.md                   # Mermaid ER diagram & cardinalities
    │   ├── 15_college_dbms_queries.sql     # 15 Advanced demonstration SQL queries
    │   ├── schema_mysql.sql                # Ready-to-run script for MySQL Workbench
    │   ├── schema_postgres.sql             # Ready-to-run script for PostgreSQL + pgvector
    │   └── relational_vs_vector_search.md  # Theoretical comparison research paper
    │
    ├── run_all.bat / run_all.ps1           # One-click project launchers
    └── README.md                           # Master Documentation & Setup Guide
```

---

## 3. Step-by-Step Execution Guide (Windows PowerShell)

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL 15+ (with `pgvector`) OR MySQL Workbench 8.0+

---

### Quick Launch (One-Click)
Inside `f:\E_com_with_AI\BuySmart\`, double-click `run_all.bat` or run `.\run_all.ps1` in PowerShell.

---

### Step 1: Backend Setup & Seed Data

Open Windows PowerShell in the project root:

```powershell
cd f:\E_com_with_AI\BuySmart\backend

# 1. Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment file
# By default, SQLite is configured for zero-setup local demonstration.
# To connect to PostgreSQL or MySQL, update DATABASE_URL in .env
Copy-Item .env.example .env

# Optional: Add your Google Gemini API key to .env for real LLM generation
# GEMINI_API_KEY=AIzaSy...

# 4. Populate database with realistic products, categories, reviews & RAG policies
python seed_data.py

# 5. Start the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be operational at:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Alternative ReDoc UI**: `http://127.0.0.1:8000/redoc`

---

### Step 2: Frontend Setup & Dev Server

Open a second Windows PowerShell terminal:

```powershell
cd f:\E_com_with_AI\BuySmart\frontend

# 1. Install frontend dependencies
npm install

# 2. Start the Vite React development server
npm run dev
```

Frontend will be operational at:
- **Web App**: `http://localhost:5173`

---

## 4. Default Demonstration Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@buysmart.com` | `admin123` | Full catalog creation, stock adjustment, KPI metrics, RAG document ingestion |
| **Customer 1** | `john@example.com` | `customer123` | Browse, chat with AI, cart operations, atomic checkout, reviews |
| **Customer 2** | `priya@example.com` | `customer123` | Secondary customer account for multi-user review & order testing |

*(Quick one-click demo login buttons are available directly on the `/login` screen).*

---

## 5. College DBMS Evaluation Demonstration

For demonstration in **MySQL Workbench** or **pgAdmin**:

1. Open `dbms_docs/schema_mysql.sql` in MySQL Workbench.
2. Execute the entire script to create `buysmart_db`, all 13 tables, checks, indexes, and views.
3. Open `dbms_docs/15_college_dbms_queries.sql` and demonstrate queries covering:
   - **Query 1**: 4-table `INNER JOIN` calculating category sales and revenue.
   - **Query 2**: `LEFT OUTER JOIN` with `IS NULL` to locate unpurchased inventory.
   - **Query 3**: Correlated Subquery finding the top-priced product in each department.
   - **Query 4**: `NOT EXISTS` finding users who haven't placed orders.
   - **Query 5**: `GROUP BY` and `HAVING` identifying premium brands.
   - **Query 6**: Mathematical weighted rating calculations.
   - **Query 7**: Window function `DENSE_RANK() OVER (PARTITION BY category_id ORDER BY price DESC)`.
   - **Query 8**: Running Cumulative Total `SUM() OVER (ORDER BY created_at)`.
   - **Query 9 & 10**: Database View `view_product_catalog_summary` filtering.
   - **Query 11**: ACID Transaction with row-level locks and atomic stock decrement.
   - **Query 12**: `EXPLAIN` query execution plan verification on composite indexes.
   - **Query 13**: CHECK constraint rejection verification.
   - **Query 14**: Self-Join generating alternative recommendations within budget.
   - **Query 15**: Multi-criteria catalog search query matching the FastAPI backend logic.

---

## 6. Running Automated Tests

Run the backend test suite:

```powershell
cd f:\E_com_with_AI\BuySmart\backend
.\venv\Scripts\python.exe -m pytest tests/ -v
```

Tests verify:
- Atomic checkout transactions and inventory decrement.
- Rollback prevention on insufficient stock.
- Vector embedding generation and cosine similarity calculations.
- Budget and intent extraction from natural language shopping queries.

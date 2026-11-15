# BuySmart Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| CARTS : "owns (1:1)"
    USERS ||--o{ ORDERS : "places (1:N)"
    USERS ||--o{ PRODUCT_REVIEWS : "writes (1:N)"
    USERS ||--o{ CHAT_SESSIONS : "initiates (1:N)"
    USERS ||--o{ PRODUCT_BOOKMARKS : "saves (1:N)"

    CATEGORIES ||--o{ PRODUCTS : "classifies (1:N)"

    PRODUCTS ||--o{ PRODUCT_REVIEWS : "receives (1:N)"
    PRODUCTS ||--o{ CART_ITEMS : "added_to (1:N)"
    PRODUCTS ||--o{ ORDER_ITEMS : "invoiced_in (1:N)"
    PRODUCTS ||--o{ PRODUCT_BOOKMARKS : "bookmarked_in (1:N)"
    PRODUCTS ||--o{ DOCUMENT_CHUNKS : "grounded_in (0:N)"

    CARTS ||--o{ CART_ITEMS : "contains (1:N)"
    ORDERS ||--o{ ORDER_ITEMS : "contains (1:N)"

    DOCUMENTS ||--o{ DOCUMENT_CHUNKS : "split_into (1:N)"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "consists_of (1:N)"

    USERS {
        int id PK
        string name
        string email UK
        string hashed_password
        string role
        timestamp created_at
    }

    CATEGORIES {
        int id PK
        string name UK
        string description
    }

    PRODUCTS {
        int id PK
        int category_id FK
        string name
        string brand
        text description
        decimal price
        int stock_quantity
        json specifications
        string image_url
        timestamp created_at
    }

    PRODUCT_REVIEWS {
        int id PK
        int user_id FK
        int product_id FK
        int rating
        text review_text
        timestamp created_at
    }

    CARTS {
        int id PK
        int user_id FK, UK
        timestamp created_at
    }

    CART_ITEMS {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
    }

    ORDERS {
        int id PK
        int user_id FK
        decimal total_amount
        string order_status
        timestamp created_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }

    DOCUMENTS {
        int id PK
        string title
        string document_type
        string source
        timestamp created_at
    }

    DOCUMENT_CHUNKS {
        int id PK
        int document_id FK
        int product_id FK
        text chunk_text
        int chunk_index
        vector embedding
    }

    CHAT_SESSIONS {
        int id PK
        int user_id FK
        timestamp created_at
    }

    CHAT_MESSAGES {
        int id PK
        int session_id FK
        string role
        text message
        timestamp created_at
    }

    PRODUCT_BOOKMARKS {
        int id PK
        int user_id FK
        int product_id FK
        timestamp created_at
    }
```

---

## Cardinalities & Relational Relationships Summary

1. **User to Cart**: `1 : 1` (Each user has at most one active cart, enforced by `UNIQUE(user_id)`).
2. **User to Orders**: `1 : N` (A user may place zero, one, or many orders; each order belongs to exactly one user).
3. **Category to Products**: `1 : N` (A category groups multiple products; each product belongs to one primary category).
4. **Product to Reviews**: `1 : N` (A product receives multiple reviews; each customer can review each product at most once, enforced by `UNIQUE(user_id, product_id)`).
5. **Cart to Cart Items**: `1 : N` (A cart contains multiple items; duplicate items are consolidated by updating the quantity).
6. **Order to Order Items**: `1 : N` (An order consists of multiple purchased products; historical prices are frozen in `unit_price`).
7. **Document to Document Chunks**: `1 : N` (Knowledge base documents are recursively split into vector chunks).
8. **Chat Session to Chat Messages**: `1 : N` (Ordered chronological conversation turns between customer and assistant).

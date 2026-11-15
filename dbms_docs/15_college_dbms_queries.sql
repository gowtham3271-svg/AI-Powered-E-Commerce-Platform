-- ====================================================================
-- BuySmart DBMS Project: 15 Core Demonstration SQL Queries
-- Designed for Academic Evaluation, Viva Voce & Laboratory Demonstration
-- Compatible with MySQL Workbench and PostgreSQL
-- ====================================================================

-- --------------------------------------------------------------------
-- QUERY 1: Multi-Table INNER JOIN with Sales Aggregates
-- Concept: INNER JOIN across 4 tables (orders, order_items, products, categories)
-- Purpose: Calculate total units sold and revenue generated per product category
-- --------------------------------------------------------------------
SELECT 
    c.name AS category_name,
    COUNT(DISTINCT o.id) AS total_orders_count,
    SUM(oi.quantity) AS total_units_sold,
    ROUND(SUM(oi.quantity * oi.unit_price), 2) AS total_revenue
FROM categories c
JOIN products p ON c.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.order_status = 'completed'
GROUP BY c.name
ORDER BY total_revenue DESC;

-- --------------------------------------------------------------------
-- QUERY 2: LEFT OUTER JOIN to Identify Unsold Inventory
-- Concept: LEFT JOIN with NULL check to find products never ordered
-- Purpose: Inventory optimization — identify dead stock needing discounts
-- --------------------------------------------------------------------
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.brand,
    p.price,
    p.stock_quantity,
    c.name AS category_name
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.id IS NULL
ORDER BY p.price DESC;

-- --------------------------------------------------------------------
-- QUERY 3: Correlated Subquery
-- Concept: Subquery referencing outer query to find top-priced product in each category
-- Purpose: Category pricing benchmark without window functions
-- --------------------------------------------------------------------
SELECT 
    p1.category_id,
    c.name AS category_name,
    p1.name AS product_name,
    p1.brand,
    p1.price
FROM products p1
JOIN categories c ON p1.category_id = c.id
WHERE p1.price = (
    SELECT MAX(p2.price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
)
ORDER BY p1.price DESC;

-- --------------------------------------------------------------------
-- QUERY 4: Subquery with NOT EXISTS (Set Difference)
-- Concept: Discover inactive users who registered but never placed an order
-- Purpose: Targeted promotional campaign list
-- --------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    u.created_at AS registration_date
FROM users u
WHERE u.role = 'customer'
  AND NOT EXISTS (
      SELECT 1 
      FROM orders o 
      WHERE o.user_id = u.id
  )
ORDER BY u.created_at ASC;

-- --------------------------------------------------------------------
-- QUERY 5: GROUP BY and HAVING Clause
-- Concept: Filtering aggregated groups using HAVING (brands with > 2 products and avg price > ₹30,000)
-- Purpose: Identifying premium market brands
-- --------------------------------------------------------------------
SELECT 
    p.brand,
    COUNT(p.id) AS total_catalog_products,
    ROUND(AVG(p.price), 2) AS average_price,
    MIN(p.price) AS lowest_price,
    MAX(p.price) AS highest_price
FROM products p
GROUP BY p.brand
HAVING COUNT(p.id) >= 2 
   AND AVG(p.price) > 30000
ORDER BY average_price DESC;

-- --------------------------------------------------------------------
-- QUERY 6: Customer Sentiment & Rating Aggregates
-- Concept: Conditional aggregation and mathematical rounding
-- Purpose: Products with at least 4.0 average rating and at least 2 reviews
-- --------------------------------------------------------------------
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.brand,
    p.price,
    COUNT(pr.id) AS review_count,
    ROUND(AVG(pr.rating), 2) AS avg_rating,
    SUM(CASE WHEN pr.rating = 5 THEN 1 ELSE 0 END) AS five_star_reviews
FROM products p
JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.name, p.brand, p.price
HAVING AVG(pr.rating) >= 4.0
ORDER BY avg_rating DESC, review_count DESC;

-- --------------------------------------------------------------------
-- QUERY 7: Window Function (DENSE_RANK)
-- Concept: Ranking items within each category partition by price descending
-- Purpose: Fast retrieval of top 2 most expensive products per department
-- --------------------------------------------------------------------
SELECT * FROM (
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        c.name AS category_name,
        p.price,
        DENSE_RANK() OVER (PARTITION BY p.category_id ORDER BY p.price DESC) AS price_rank
    FROM products p
    JOIN categories c ON p.category_id = c.id
) ranked
WHERE ranked.price_rank <= 2;

-- --------------------------------------------------------------------
-- QUERY 8: Window Function (Running Cumulative Total)
-- Concept: Cumulative sum over chronological order timeline
-- Purpose: Business intelligence running revenue curve
-- --------------------------------------------------------------------
SELECT 
    o.id AS order_id,
    o.created_at AS order_date,
    o.total_amount AS order_value,
    SUM(o.total_amount) OVER (ORDER BY o.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_cumulative_revenue
FROM orders o
WHERE o.order_status = 'completed'
ORDER BY o.created_at ASC;

-- --------------------------------------------------------------------
-- QUERY 9: View Utilization with Multi-Criteria Filtering
-- Concept: Querying through pre-compiled database view
-- Purpose: High-level store dashboard showing in-stock, highly-rated items
-- --------------------------------------------------------------------
SELECT 
    product_name,
    brand,
    category_name,
    price,
    stock_quantity,
    avg_rating,
    total_reviews
FROM view_product_catalog_summary
WHERE inventory_status != 'OUT OF STOCK' 
  AND avg_rating >= 4.0
ORDER BY price ASC;

-- --------------------------------------------------------------------
-- QUERY 10: Derived Table (Subquery in FROM clause) - Cart Abandonment
-- Concept: Join cart contents with product prices to calculate abandoned cart valuation
-- Purpose: Trigger marketing emails for high-value abandoned carts
-- --------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.name AS customer_name,
    u.email,
    cart_summary.cart_items_count,
    cart_summary.potential_cart_value
FROM users u
JOIN (
    SELECT 
        c.user_id,
        COUNT(ci.id) AS cart_items_count,
        SUM(ci.quantity * p.price) AS potential_cart_value
    FROM carts c
    JOIN cart_items ci ON c.id = ci.cart_id
    JOIN products p ON ci.product_id = p.id
    GROUP BY c.user_id
) cart_summary ON u.id = cart_summary.user_id
ORDER BY potential_cart_value DESC;

-- --------------------------------------------------------------------
-- QUERY 11: Transaction & Concurrency Control (ACID Demonstration)
-- Concept: Atomic order placement with stock check & decrement
-- Purpose: Guarantee zero negative inventory under concurrent checkout
-- --------------------------------------------------------------------
-- In MySQL:
START TRANSACTION;
-- 1. Verify and decrement inventory (row-level lock with FOR UPDATE)
SELECT stock_quantity FROM products WHERE id = 1 FOR UPDATE;
-- 2. Decrement stock if sufficient
UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = 1 AND stock_quantity >= 1;
-- 3. Create confirmed order
INSERT INTO orders (user_id, total_amount, order_status) VALUES (1, 79999.00, 'completed');
-- 4. Insert order line item (using LAST_INSERT_ID())
INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
VALUES (LAST_INSERT_ID(), 1, 1, 79999.00);
-- 5. Commit atomic transaction
COMMIT;

-- --------------------------------------------------------------------
-- QUERY 12: Query Execution Plan (Index Performance Demonstration)
-- Concept: EXPLAIN plan verification showing index lookup vs table scan
-- Purpose: Demonstrates optimization on idx_product_brand_price
-- --------------------------------------------------------------------
EXPLAIN SELECT id, name, price, stock_quantity 
FROM products 
WHERE brand = 'Apple' AND price BETWEEN 50000 AND 150000;

-- --------------------------------------------------------------------
-- QUERY 13: Constraint Enforcement Testing
-- Concept: Integrity constraint validation
-- Purpose: Prove DBMS rejects invalid data (demonstrating CHECK constraint)
-- --------------------------------------------------------------------
-- This query will intentionally fail with CHECK constraint violation:
-- INSERT INTO products (category_id, name, brand, description, price, stock_quantity)
-- VALUES (1, 'Faulty Item', 'Test', 'Negative price test', -500.00, 10);

-- --------------------------------------------------------------------
-- QUERY 14: Self-Join for Alternative Product Recommendation
-- Concept: Self-joining products table on same category with price variance <= 20%
-- Purpose: Generate "Users also considered" recommendations in pure SQL
-- --------------------------------------------------------------------
SELECT 
    p1.name AS selected_product,
    p1.price AS selected_price,
    p2.name AS alternative_product,
    p2.brand AS alternative_brand,
    p2.price AS alternative_price,
    ROUND(ABS(p1.price - p2.price), 2) AS price_difference
FROM products p1
JOIN products p2 ON p1.category_id = p2.category_id AND p1.id != p2.id
WHERE p1.id = 1
  AND ABS(p1.price - p2.price) <= (p1.price * 0.20)
ORDER BY price_difference ASC
LIMIT 5;

-- --------------------------------------------------------------------
-- QUERY 15: Full Multi-Filter Catalog Search (FastAPI Backend Core Query)
-- Concept: Dynamic filtering across Category, Budget Cap, In-Stock & Rating
-- Purpose: SQL backbone for AI shopping assistant candidate filtering
-- --------------------------------------------------------------------
SELECT 
    p.id,
    p.name,
    p.brand,
    c.name AS category,
    p.price,
    p.stock_quantity,
    COALESCE(ROUND(AVG(pr.rating), 1), 0.0) AS rating,
    COUNT(pr.id) AS reviews_count
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN product_reviews pr ON p.id = pr.product_id
WHERE c.name = 'Laptops'
  AND p.price <= 60000.00
  AND p.stock_quantity > 0
GROUP BY p.id, p.name, p.brand, c.name, p.price, p.stock_quantity
HAVING COALESCE(AVG(pr.rating), 5.0) >= 3.5
ORDER BY rating DESC, p.price ASC;

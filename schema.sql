-- ============================================================================
-- CART INSIGHT · POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Purpose: Permanent storage for Multi-Store Retail Invoices, Inventory & Forecasts
-- ============================================================================

-- 1. USERS & STORE PROFILES
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    store_name VARCHAR(200) NOT NULL DEFAULT 'My Supermarket',
    api_key VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS & LIVE STORE SHELF INVENTORY
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    current_stock INT DEFAULT 0,
    reorder_point INT DEFAULT 10,
    lead_time_days INT DEFAULT 3,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uix_store_product_name UNIQUE (store_id, name)
);

-- 3. SALES TRANSACTIONS (INCREMENTAL HISTORICAL BILLS)
CREATE TABLE IF NOT EXISTS sales_transactions (
    id BIGSERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(100) DEFAULT '',
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    transaction_date VARCHAR(50) NOT NULL, -- e.g. 2025-05-14 or ISO timestamp
    quantity NUMERIC(10, 2) DEFAULT 1.00,
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    gross_profit NUMERIC(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    dataset_id VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DATASET UPLOAD AUDIT LOG
CREATE TABLE IF NOT EXISTS dataset_uploads (
    id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dataset_id VARCHAR(100) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    kind VARCHAR(50) DEFAULT 'sales',
    rows_count INT DEFAULT 0,
    new_rows_count INT DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PASSWORD RESET & OTP VERIFICATION TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    reset_token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- HIGH-SPEED QUERY INDEXES FOR MILLISECOND ANALYTICS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users (api_key);
CREATE INDEX IF NOT EXISTS idx_products_store_cat ON products (store_id, category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (store_id, name);
CREATE INDEX IF NOT EXISTS idx_sales_store_date ON sales_transactions (store_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_sales_store_prod ON sales_transactions (store_id, product_name);
CREATE INDEX IF NOT EXISTS idx_sales_dedup ON sales_transactions (store_id, invoice_id, transaction_date, product_name);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_email_otp ON password_reset_tokens (email, otp_code);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_token ON password_reset_tokens (reset_token);

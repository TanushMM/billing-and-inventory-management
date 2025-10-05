-- Billing & Inventory MVP Schema
BEGIN;

CREATE TABLE IF NOT EXISTS billers (
  biller_id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  category_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  gst_rate DECIMAL(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
  unit_id VARCHAR(50) PRIMARY KEY,
  unit_name VARCHAR(50) NOT NULL UNIQUE,
  conversion_factor DECIMAL(10, 4) NOT NULL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS products (
  product_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id VARCHAR(50) REFERENCES categories(category_id),
  unit_id VARCHAR(50) REFERENCES units(unit_id),
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  is_weighted BOOLEAN DEFAULT FALSE,
  weight DECIMAL(10, 2),
  weight_unit_id VARCHAR(50) REFERENCES units(unit_id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  inventory_id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE CASCADE,
  stock_quantity DECIMAL(10, 2) NOT NULL,
  min_stock_level DECIMAL(10, 2) DEFAULT 0,
  batch_number VARCHAR(100),
  expiry_date DATE,
  last_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inventory_unique_product UNIQUE (product_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_unit_id ON products(unit_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

COMMIT;

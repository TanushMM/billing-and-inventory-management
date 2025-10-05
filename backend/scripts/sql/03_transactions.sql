BEGIN;

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE RESTRICT,
  transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL,
  total_discount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- Changed from ENUM for broader compatibility
  change_due DECIMAL(10, 2) DEFAULT 0,
  customer_credit DECIMAL(10, 2) DEFAULT 0,
  is_reprinted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS transaction_items (
  transaction_item_id VARCHAR(50) PRIMARY KEY,
  transaction_id VARCHAR(50) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL, -- Denormalized product name
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL, -- Denormalized unit price
  item_total DECIMAL(10, 2) NOT NULL,
  item_discount DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL -- Denormalized tax rate
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);

COMMIT;
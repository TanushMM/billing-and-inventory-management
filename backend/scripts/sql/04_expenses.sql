BEGIN;

CREATE TABLE IF NOT EXISTS expense_categories (
  category_id VARCHAR(50) PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS expenses (
  expense_id VARCHAR(50) PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  expense_category_id VARCHAR(50) REFERENCES expense_categories(category_id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_change_logs (
  log_id VARCHAR(50) PRIMARY KEY,
  expense_id VARCHAR(50) NOT NULL REFERENCES expenses(expense_id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(255) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_category_id ON expenses(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_expense_change_logs_expense_id ON expense_change_logs(expense_id);

COMMIT;
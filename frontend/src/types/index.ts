export interface Biller {
  biller_id: string;
  username: string;
  fullName: string;
}

export interface Category {
  category_id: string;
  name: string;
  gst_rate: number;
}

export interface Unit {
  unit_id: string;
  unit_name: string;
  conversion_factor: number;
}

export interface Product {
  product_id: string;
  name: string;
  description?: string;
  category_id: string;
  category_name: string;
  unit_id: string;
  unit_name: string;
  cost_price: number;
  selling_price: number;
  mrp: number;
  is_weighted: boolean;
  created_at: string;
  weight?: number;
  weight_unit_id?: string;
  stock_quantity: number;
  category?: Category;
  unit?: Unit;
}

export interface Inventory {
  inventory_id: string;
  product_id: string;
  stock_quantity: number;
  min_stock_level: number;
  batch_number?: string;
  expiry_date?: string;
  last_updated_at: string;
  product?: Product;
}

export interface Customer {
  customer_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  biller: Biller;
}

export interface Transaction {
  transaction_id: string;
  customer_id?: string;
  transaction_date: string;
  total_amount: number;
  total_discount: number;
  customer_name: string;
  final_amount: number;
  payment_method: 'cash' | 'upi' | 'credit';
  change_due: number;
  customer_credit: number;
  is_reprinted: boolean;
  customer?: Customer;
  items?: TransactionItem[];
}

export interface TransactionItem {
  transaction_item_id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  item_total: number;
  item_discount: number;
  tax_rate: number;
  product?: Product;
  product_name: string;
}
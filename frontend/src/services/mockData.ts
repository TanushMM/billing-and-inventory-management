import { Biller, Category, Unit, Product, Inventory } from '@/types';

// Mock data for development
export const mockBiller: Biller = {
  biller_id: 1,
  username: 'admin',
  full_name: 'Admin User',
  created_at: new Date().toISOString(),
};

export const mockCategories: Category[] = [
  { category_id: 1, name: 'Groceries', gst_rate: 5 },
  { category_id: 2, name: 'Electronics', gst_rate: 18 },
  { category_id: 3, name: 'Beverages', gst_rate: 12 },
];

export const mockUnits: Unit[] = [
  { unit_id: 1, unit_name: 'kg', conversion_factor: 1 },
  { unit_id: 2, unit_name: 'piece', conversion_factor: 1 },
  { unit_id: 3, unit_name: 'liter', conversion_factor: 1 },
];

export const mockProducts: Product[] = [
  {
    product_id: 'P001',
    name: 'Rice',
    description: 'Basmati Rice',
    category_id: 1,
    unit_id: 1,
    cost_price: 50,
    selling_price: 65,
    mrp: 70,
    is_weighted: true,
    created_at: new Date().toISOString(),
    category: mockCategories[0],
    unit: mockUnits[0],
  },
  {
    product_id: 'P002',
    name: 'LED Bulb',
    description: '9W LED Bulb',
    category_id: 2,
    unit_id: 2,
    cost_price: 100,
    selling_price: 130,
    mrp: 150,
    is_weighted: false,
    created_at: new Date().toISOString(),
    category: mockCategories[1],
    unit: mockUnits[1],
  },
];

export const mockInventory: Inventory[] = [
  {
    inventory_id: 1,
    product_id: 'P001',
    stock_quantity: 100,
    min_stock_level: 20,
    batch_number: 'B001',
    expiry_date: '2025-12-31',
    last_updated_at: new Date().toISOString(),
    product: mockProducts[0],
  },
  {
    inventory_id: 2,
    product_id: 'P002',
    stock_quantity: 50,
    min_stock_level: 10,
    batch_number: 'B002',
    last_updated_at: new Date().toISOString(),
    product: mockProducts[1],
  },
];

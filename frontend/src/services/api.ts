import type { LoginCredentials, AuthResponse, Product, Category, Unit, Inventory, Biller, Customer } from '@/types';

// The base URL of your Express backend API
const API_BASE_URL = 'http://localhost:4000/api';

// Keys for storing authentication data in local storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * A generic API call helper function.
 * It automatically adds the Authorization header for authenticated requests.
 * It also handles API errors and throws a descriptive error message.
 * @param endpoint The API endpoint to call (e.g., '/products').
 * @param options The options for the fetch request (method, body, etc.).
 * @returns A promise that resolves with the JSON response.
 */
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred' }));
    throw new Error(errorData.error || `API call failed with status ${response.status}`);
  }

  // For DELETE requests with 204 No Content response
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// authService works fine
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token && response.biller) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.biller));
    }
    return response;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): Biller | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// productService works fine
export const productService = {
  getAll(): Promise<Product[]> {
    return apiCall<Product[]>('/products');
  },
  getById(id: string): Promise<Product> {
    return apiCall<Product>(`/products/${id}`);
  },
  create(product: Omit<Product, 'created_at' | 'stock_quantity'>): Promise<Product> {
    return apiCall<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  update(id: string, product: Partial<Product>): Promise<Product> {
    return apiCall<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },
  delete(id: string): Promise<void> {
    return apiCall<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

export const inventoryService = {
  getAll(): Promise<Inventory[]> {
    return apiCall<Inventory[]>('/inventory');
  },
  getByProductId(productId: string): Promise<Inventory> {
    return apiCall<Inventory>(`/inventory/${productId}`);
  },
  // This corresponds to the upsertInventory controller function
  update(productId: string, inventory: Partial<Omit<Inventory, 'inventory_id' | 'product_id'>>): Promise<Inventory> {
    return apiCall<Inventory>(`/inventory/${productId}`, {
      method: 'PUT', // or 'POST', depending on your router setup for upsert
      body: JSON.stringify(inventory),
    });
  },
};

// categoryService works fine
export const categoryService = {
  getAll(): Promise<Category[]> {
    return apiCall<Category[]>('/categories');
  },
  create(category: Omit<Category, 'category_id'>): Promise<Category> {
    return apiCall<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
  update(id: string, category: Partial<Category>): Promise<Category> {
    return apiCall<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },
  delete(id: string): Promise<void> {
    return apiCall<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
  
// unitService works fine
export const unitService = {
  getAll(): Promise<Unit[]> {
    return apiCall<Unit[]>('/units');
  },
  create(unit: Omit<Unit, 'unit_id'>): Promise<Unit> {
    return apiCall<Unit>('/units', {
      method: 'POST',
      body: JSON.stringify(unit),
    });
  },
  update(id: string, unit: Partial<Unit>): Promise<Unit> {
    return apiCall<Unit>(`/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(unit),
    });
  },
  delete(id: string): Promise<void> {
    return apiCall<void>(`/units/${id}`, {
      method: 'DELETE',
    });
  },
};

export const customerService = {
  getAll(): Promise<Customer[]> {
    return apiCall<Customer[]>('/customers');
  },
  create(customer: Omit<Customer, 'customer_id' | 'created_at'>): Promise<Customer> {
    return apiCall<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },
  update(id: string, customer: Partial<Omit<Customer, 'customer_id' | 'created_at'>>): Promise<Customer> {
    return apiCall<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  },
  delete(id: string): Promise<void> {
    return apiCall<void>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

import { mockTransactions } from "./mockData"
import type { Transaction } from '@/types';

// Mock APIs
export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockTransactions];
  },

  async getById(id: string): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const transaction = mockTransactions.find(t => t.transaction_id === id);
    if (!transaction) throw new Error('Transaction not found');
    return transaction;
  },

  async create(transaction: Omit<Transaction, 'transaction_id' | 'transaction_date'>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTransaction: Transaction = {
      ...transaction,
      transaction_id: "hello world",
      transaction_date: new Date().toISOString(),
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  },
};
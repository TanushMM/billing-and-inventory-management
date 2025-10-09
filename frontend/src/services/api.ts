import type { LoginCredentials, AuthResponse, Product, Category, Unit, Inventory, Biller, Customer, Transaction } from '@/types';

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

export const transactionService = {
  getAll(params: { page: number, limit: number, filter?: string, startDate?: string, endDate?: string }): Promise<{ data: Transaction[], total: number }> {
    const query = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });
    if (params.filter) query.set('filter', params.filter);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    return apiCall<{ data: Transaction[], total: number }>(`/transactions?${query.toString()}`);
  },
  async export(params: { filter?: string, startDate?: string, endDate?: string }): Promise<void> {
    const query = new URLSearchParams();
    if (params.filter) query.set('filter', params.filter);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/transactions/export?${query.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-report.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  create(transaction: Omit<Transaction, 'transaction_id' | 'transaction_date'>): Promise<Transaction> {
    return apiCall<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },
};


// MOCK
import {mockExpenses, mockExpenseChangeLogs, mockExpenseCategories} from './mockData';
import {Expense, ExpenseCategory, ExpenseChangeLog } from '@/types';

// Expense Category Service
export const expenseCategoryService = {
  async getAll(): Promise<ExpenseCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockExpenseCategories];
  },

  async getById(id: string): Promise<ExpenseCategory> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const category = mockExpenseCategories.find(c => c.category_id === id);
    if (!category) throw new Error('Category not found');
    return category;
  },

  async create(category: Omit<ExpenseCategory, 'category_id'>): Promise<ExpenseCategory> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCategory: ExpenseCategory = {
      ...category,
      category_id: crypto.randomUUID(),
    };
    mockExpenseCategories.push(newCategory);
    return newCategory;
  },

  async update(id: string, category: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockExpenseCategories.findIndex(c => c.category_id === id);
    if (index === -1) throw new Error('Category not found');
    mockExpenseCategories[index] = { ...mockExpenseCategories[index], ...category };
    return mockExpenseCategories[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockExpenseCategories.findIndex(c => c.category_id === id);
    if (index === -1) throw new Error('Category not found');
    mockExpenseCategories.splice(index, 1);
  },
};

// Expense Service
export const expenseService = {
  async getAll(): Promise<Expense[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockExpenses.map(expense => ({
      ...expense,
      category: mockExpenseCategories.find(c => c.category_id === expense.expense_category_id),
    }));
  },

  async getById(id: string): Promise<Expense> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const expense = mockExpenses.find(e => e.expense_id === id);
    if (!expense) throw new Error('Expense not found');
    return {
      ...expense,
      category: mockExpenseCategories.find(c => c.category_id === expense.expense_category_id),
    };
  },

  async create(expense: Omit<Expense, 'expense_id' | 'created_at'>): Promise<Expense> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newExpense: Expense = {
      ...expense,
      expense_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      category: mockExpenseCategories.find(c => c.category_id === expense.expense_category_id),
    };
    mockExpenses.push(newExpense);
    return newExpense;
  },

  async update(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockExpenses.findIndex(e => e.expense_id === id);
    if (index === -1) throw new Error('Expense not found');
    
    const oldExpense = mockExpenses[index];
    const currentUser = authService.getCurrentUser();
    
    // Track changes
    Object.keys(expenseData).forEach(key => {
      const field = key as keyof Expense;
      if (oldExpense[field] !== expenseData[field] && field !== 'category') {
        const changeLog: ExpenseChangeLog = {
          log_id: crypto.randomUUID(),
          expense_id: id,
          field_name: key,
          old_value: String(oldExpense[field] || ''),
          new_value: String(expenseData[field] || ''),
          changed_by: currentUser?.full_name || 'Unknown',
          changed_at: new Date().toISOString(),
        };
        mockExpenseChangeLogs.push(changeLog);
      }
    });
    
    mockExpenses[index] = { 
      ...oldExpense, 
      ...expenseData,
      category: mockExpenseCategories.find(c => c.category_id === (expenseData.expense_category_id || oldExpense.expense_category_id)),
    };
    return mockExpenses[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockExpenses.findIndex(e => e.expense_id === id);
    if (index === -1) throw new Error('Expense not found');
    mockExpenses.splice(index, 1);
  },

  async getChangeLogs(expenseId: string): Promise<ExpenseChangeLog[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockExpenseChangeLogs
      .filter(log => log.expense_id === expenseId)
      .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  },
};
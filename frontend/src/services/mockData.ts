import { ExpenseCategory, Expense, ExpenseChangeLog } from '@/types';

export const mockExpenseCategories: ExpenseCategory[] = [
  { category_id: crypto.randomUUID(), category_name: 'Utilities' },
  { category_id: crypto.randomUUID(), category_name: 'Rent' },
  { category_id: crypto.randomUUID(), category_name: 'Salaries' },
  { category_id: crypto.randomUUID(), category_name: 'Marketing' },
  { category_id: crypto.randomUUID(), category_name: 'Supplies' },
  { category_id: crypto.randomUUID(), category_name: 'Maintenance' },
];

export const mockExpenses: Expense[] = [
  {
    expense_id: crypto.randomUUID(),
    description: 'Electricity Bill - January',
    amount: 5000,
    expense_date: '2025-01-15',
    expense_category_id: mockExpenseCategories[0].category_id,
    notes: 'Monthly electricity bill',
    created_at: new Date('2025-01-15').toISOString(),
    category: mockExpenseCategories[0],
  },
  {
    expense_id: crypto.randomUUID(),
    description: 'Store Rent - January',
    amount: 15000,
    expense_date: '2025-01-01',
    expense_category_id: mockExpenseCategories[1].category_id,
    notes: 'Monthly rent payment',
    created_at: new Date('2025-01-01').toISOString(),
    category: mockExpenseCategories[1],
  },
];

export const mockExpenseChangeLogs: ExpenseChangeLog[] = [];
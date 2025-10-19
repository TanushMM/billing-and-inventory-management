import { z } from "zod";

export const expenseCategorySchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
});

export const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  expense_date: z.string().date("Invalid date format"),
  expense_category_id: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
});

export type ExpenseCategoryCreateInput = z.infer<typeof expenseCategorySchema>;
export type ExpenseCreateInput = z.infer<typeof expenseSchema>;
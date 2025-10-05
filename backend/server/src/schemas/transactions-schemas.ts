import { z } from "zod";

export const transactionItemSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  item_total: z.number(),
  item_discount: z.number().default(0),
  tax_rate: z.number(),
});

export const transactionCreateSchema = z.object({
  customer_id: z.string().optional(),
  total_amount: z.number(),
  total_discount: z.number(),
  final_amount: z.number(),
  payment_method: z.enum(['cash', 'upi', 'credit']),
  change_due: z.number().default(0),
  customer_credit: z.number().default(0),
  is_reprinted: z.boolean().default(false),
  items: z.array(transactionItemSchema),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
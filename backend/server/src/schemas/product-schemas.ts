import { z } from "zod"

export const productCreateSchema = z.object({
  // product_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category_id: z.string(),
  unit_id: z.string(),
  cost_price: z.coerce.number().nonnegative(),
  selling_price: z.coerce.number().nonnegative(),
  mrp: z.coerce.number().nonnegative(),
  is_weighted: z.coerce.boolean().optional().default(false),
  weight: z.coerce.number().nonnegative().optional().nullable(),
  weight_unit_id: z.string().optional().nullable()
})

export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category_id: z.string(),
  unit_id: z.string(),
  cost_price: z.coerce.number().nonnegative().optional(),
  selling_price: z.coerce.number().nonnegative().optional(),
  mrp: z.coerce.number().nonnegative().optional(),
  is_weighted: z.coerce.boolean().optional(),
  weight: z.coerce.number().nonnegative().optional().nullable(),
  weight_unit_id: z.string().optional().nullable()
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

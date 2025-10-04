import { z } from "zod"

export const inventoryUpsertSchema = z.object({
  inventory_id: z.string(),
  stock_quantity: z.coerce.number(),
  min_stock_level: z.coerce.number().optional().default(0),
  batch_number: z.string().optional().nullable(),
  expiry_date: z
    .string()
    .date()
    .optional()
    .nullable()
    .or(z.coerce.date().nullable())
    .transform((v) => (v ? new Date(v) : null)),
})
// Note: z.string().date() requires zod-date plugin; we simulate by coerce or accept ISO and coerce above.

export type InventoryUpsertInput = z.infer<typeof inventoryUpsertSchema>

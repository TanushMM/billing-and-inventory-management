import { z } from "zod"

export const unitCreateSchema = z.object({
  unit_name: z.string().min(1),
  conversion_factor: z.coerce.number().positive().optional().default(1.0),
})

export const unitUpdateSchema = z.object({
  unit_name: z.string().min(1).optional(),
  conversion_factor: z.coerce.number().positive().optional(),
})

export type UnitCreateInput = z.infer<typeof unitCreateSchema>
export type UnitUpdateInput = z.infer<typeof unitUpdateSchema>

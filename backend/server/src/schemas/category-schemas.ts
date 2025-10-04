import { z } from "zod"

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  gst_rate: z.coerce.number().nonnegative(),
})

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  gst_rate: z.coerce.number().nonnegative().optional(),
})

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>

import { z } from "zod"

export const customerCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).optional().nullable(),
  address: z.string().optional().nullable(),
})

export const customerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).optional().nullable(),
  address: z.string().optional().nullable(),
})

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>
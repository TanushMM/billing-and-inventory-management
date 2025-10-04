import type { Request, Response, NextFunction } from "express"
import type { AnyZodObject } from "zod"

export function validateBody(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.format() })
    }
    req.body = parsed.data
    next()
  }
}

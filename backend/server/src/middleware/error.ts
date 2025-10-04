import type { NextFunction, Request, Response } from "express"

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: "Not found" })
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("[error]", err)
  const status = err.status ? Number(err.status) : 500
  res.status(status).json({
    error: err.message || "Internal Server Error",
    details: err.details,
  })
}

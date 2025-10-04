import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { ENV } from "../config/env.js"

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" })
  }
  const token = header.slice("Bearer ".length)
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as {
      sub: string | number
      username: string
      full_name: string
    }
    req.user = {
      biller_id: Number(payload.sub),
      username: payload.username,
      full_name: payload.full_name,
    }
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

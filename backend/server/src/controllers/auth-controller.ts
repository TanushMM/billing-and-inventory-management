import type { Request, Response } from "express"
import { pool } from "../config/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ENV } from "../config/env.js"

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as { username: string; password: string }
  const { rows } = await pool.query(
    `SELECT biller_id, username, password_hash, full_name
     FROM billers
     WHERE username = $1`,
    [username],
  )

  const user = rows[0]
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = jwt.sign({ sub: user.biller_id, username: user.username, full_name: user.full_name }, ENV.JWT_SECRET, {
    expiresIn: "1d",
  })

  return res.json({
    token,
    biller: { biller_id: user.biller_id, fullName: user.full_name, username: user.username },
  })
}

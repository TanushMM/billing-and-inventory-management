import type { Request, Response } from "express"
import { pool } from "../config/db.js"
import { randomUUID } from "crypto"

export async function listCustomers(_req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT customer_id, name, email, phone, address, created_at
     FROM customers
     ORDER BY name ASC`,
  )
  res.json(rows)
}

export async function createCustomer(req: Request, res: Response) {
  const { name, email, phone, address } = req.body as {
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
  }
  try {
    const uuid = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO customers (customer_id, name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING customer_id, name, email, phone, address, created_at`,
      [uuid, name, email ?? null, phone ?? null, address ?? null],
    )
    res.status(201).json(rows[0])
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A customer with this email or phone number already exists." })
    }
    throw err
  }
}

export async function updateCustomer(req: Request, res: Response) {
  const id = req.params.id
  const { name, email, phone, address } = req.body as {
    name?: string
    email?: string | null
    phone?: string | null
    address?: string | null
  }

  const { rows } = await pool.query(
    `UPDATE customers
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         address = COALESCE($4, address)
     WHERE customer_id = $5
     RETURNING customer_id, name, email, phone, address, created_at`,
    [name ?? null, email ?? null, phone ?? null, address ?? null, id],
  )
  if (!rows[0]) return res.status(404).json({ error: "Customer not found" })
  res.json(rows[0])
}

export async function deleteCustomer(req: Request, res: Response) {
  const id = req.params.id
  const result = await pool.query(`DELETE FROM customers WHERE customer_id = $1`, [id])
  if (result.rowCount === 0) return res.status(404).json({ error: "Customer not found" })
  res.status(204).send()
}
import type { Request, Response } from "express"
import { pool } from "../config/db.js"

import { randomUUID } from "crypto"

export async function listCategories(_req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT category_id, name, gst_rate
     FROM categories
     ORDER BY name ASC`,
  )
  res.json(rows)
}

export async function createCategory(req: Request, res: Response) {
  const { name, gst_rate } = req.body as { name: string; gst_rate: number }
  try {
    const uuid = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO categories (category_id, name, gst_rate)
       VALUES ($1, $2, $3)
       RETURNING category_id, name, gst_rate`,
      [uuid, name, gst_rate],
    )
    res.status(201).json(rows[0])
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Category name already exists" })
    }
    throw err
  }
}

export async function updateCategory(req: Request, res: Response) {
  const id = String(req.params.id)
  const { name, gst_rate } = req.body as { name?: string; gst_rate?: number }

  const { rows } = await pool.query(
    `UPDATE categories
     SET name = COALESCE($1, name),
         gst_rate = COALESCE($2, gst_rate)
     WHERE category_id = $3
     RETURNING category_id, name, gst_rate`,
    [name ?? null, gst_rate ?? null, id],
  )
  if (!rows[0]) return res.status(404).json({ error: "Category not found" })
  res.json(rows[0])
}

export async function deleteCategory(req: Request, res: Response) {
  const id = String(req.params.id)
  const result = await pool.query(`DELETE FROM categories WHERE category_id = $1`, [id])
  if (result.rowCount === 0) return res.status(404).json({ error: "Category not found" })
  res.status(204).send()
}

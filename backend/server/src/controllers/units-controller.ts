import type { Request, Response } from "express"
import { pool } from "../config/db.js"
import { randomUUID } from "crypto"

export async function listUnits(_req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT unit_id, unit_name, conversion_factor
     FROM units
     ORDER BY unit_name ASC`,
  )
  res.json(rows)
}

export async function createUnit(req: Request, res: Response) {
  const { unit_name, conversion_factor = 1.0 } = req.body as {
    unit_name: string
    conversion_factor?: number
  }
  try {
    const uuid = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO units (unit_id, unit_name, conversion_factor)
       VALUES ($1, $2, $3)
       RETURNING unit_id, unit_name, conversion_factor`,
      [uuid, unit_name, conversion_factor],
    )
    res.status(201).json(rows[0])
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Unit name already exists" })
    }
    throw err
  }
}

export async function updateUnit(req: Request, res: Response) {
  const id = String(req.params.id)
  const { unit_name, conversion_factor } = req.body as {
    unit_name?: string
    conversion_factor?: number
  }

  const { rows } = await pool.query(
    `UPDATE units
     SET unit_name = COALESCE($1, unit_name),
         conversion_factor = COALESCE($2, conversion_factor)
     WHERE unit_id = $3
     RETURNING unit_id, unit_name, conversion_factor`,
    [unit_name ?? null, conversion_factor ?? null, id],
  )
  if (!rows[0]) return res.status(404).json({ error: "Unit not found" })
  res.json(rows[0])
}

export async function deleteUnit(req: Request, res: Response) {
  const id = String(req.params.id)
  const result = await pool.query(`DELETE FROM units WHERE unit_id = $1`, [id])
  if (result.rowCount === 0) return res.status(404).json({ error: "Unit not found" })
  res.status(204).send()
}

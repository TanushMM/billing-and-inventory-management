import type { Request, Response } from "express"
import { pool } from "../config/db.js"

export async function listInventory(_req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT
       i.inventory_id,
       i.product_id,
       i.stock_quantity,
       i.min_stock_level,
       i.batch_number,
       i.expiry_date,
       i.last_updated_at,
       json_build_object(
        'product_id', p.product_id,
        'name', p.name,
        'unit', json_build_object(
            'unit_name', u.unit_name
        )
       ) as product
     FROM inventory i
     JOIN products p ON p.product_id = i.product_id
     LEFT JOIN units u on u.unit_id = p.unit_id
     ORDER BY p.name ASC`,
  )
  res.json(rows)
}

export async function getInventoryByProduct(req: Request, res: Response) {
  const productId = req.params.productId
  const { rows } = await pool.query(
    `SELECT
       i.inventory_id,
       i.product_id,
       p.name AS product_name,
       i.stock_quantity,
       i.min_stock_level,
       i.batch_number,
       i.expiry_date,
       i.last_updated_at
     FROM inventory i
     JOIN products p ON p.product_id = i.product_id
     WHERE i.product_id = $1`,
    [productId],
  )
  if (!rows[0]) return res.status(404).json({ error: "Inventory not found" })
  res.json(rows[0])
}

export async function upsertInventory(req: Request, res: Response) {
  const productId = req.params.productId
  const {
    inventory_id,
    stock_quantity,
    min_stock_level = 0,
    batch_number,
    expiry_date,
  } = req.body as {
    inventory_id: string
    stock_quantity: number
    min_stock_level?: number
    batch_number?: string | null
    expiry_date?: Date | null
  }

  // Upsert by unique product_id
  const { rows } = await pool.query(
    `INSERT INTO inventory (inventory_id, product_id, stock_quantity, min_stock_level, batch_number, expiry_date, last_updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (product_id)
     DO UPDATE SET
       stock_quantity = EXCLUDED.stock_quantity,
       min_stock_level = EXCLUDED.min_stock_level,
       batch_number = EXCLUDED.batch_number,
       expiry_date = EXCLUDED.expiry_date,
       last_updated_at = NOW()
     RETURNING inventory_id, product_id, stock_quantity, min_stock_level, batch_number, expiry_date, last_updated_at`,
    [inventory_id, productId, stock_quantity, min_stock_level, batch_number ?? null, expiry_date ?? null],
  )
  res.json(rows[0])
}

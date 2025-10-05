import type { Request, Response } from "express"
import { pool } from "../config/db.js"

import { randomUUID } from "crypto"

export async function listProducts(_req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.description,
       p.category_id,
       c.name AS category_name,
       p.unit_id,
       u.unit_name AS unit_name,
       p.cost_price,
       p.selling_price,
       p.mrp,
       p.is_weighted,
       p.weight,
       p.weight_unit_id,
       p.created_at,
       COALESCE(i.stock_quantity, 0) AS stock_quantity -- Changed from SUM to a direct value
     FROM products p
     LEFT JOIN categories c ON c.category_id = p.category_id
     LEFT JOIN units u ON u.unit_id = p.unit_id
     LEFT JOIN inventory i ON i.product_id = p.product_id -- No GROUP BY needed now
     ORDER BY p.created_at DESC`,
  )
  res.json(rows)
}

export async function getProduct(req: Request, res: Response) {
  const id = req.params.id
  const { rows } = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.description,
       p.category_id,
       c.name AS category_name,
       p.unit_id,
       u.unit_name AS unit_name,
       p.cost_price,
       p.selling_price,
       p.mrp,
       p.is_weighted,
       p.weight,
       p.weight_unit_id,
       p.created_at
     FROM products p
     LEFT JOIN categories c ON c.category_id = p.category_id
     LEFT JOIN units u ON u.unit_id = p.unit_id
     WHERE p.product_id = $1`,
    [id],
  )
  if (!rows[0]) return res.status(404).json({ error: "Product not found" })
  res.json(rows[0])
}

export async function createProduct(req: Request, res: Response) {
  const {
    name,
    description,
    category_id,
    unit_id,
    cost_price,
    selling_price,
    mrp,
    is_weighted = false,
    weight,
    weight_unit_id,
  } = req.body as {
    name: string
    description?: string | null
    category_id?: string | null
    unit_id?: string | null
    cost_price: number
    selling_price: number
    mrp: number
    is_weighted?: boolean
    weight?: number
    weight_unit_id?: string
  }
  const uuid = randomUUID()
  try {
    await pool.query("BEGIN")
    const { rows } = await pool.query(
      `INSERT INTO products
       (product_id, name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted, weight, weight_unit_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11)
       RETURNING product_id, name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted, weight, weight_unit_id, created_at`,
      [
        uuid,
        name,
        description ?? null,
        category_id ?? null,
        unit_id ?? null,
        cost_price,
        selling_price,
        mrp,
        is_weighted,
        weight,
        weight_unit_id
      ],
    )
    const newProduct = rows[0]

    const inventoryUUID = randomUUID()

    const inventoryInsertQuery = `
        INSERT INTO inventory (inventory_id, product_id, stock_quantity, min_stock_level)
        VALUES ($1, $2, 0, 0)`
    await pool.query(inventoryInsertQuery, [inventoryUUID, uuid]);

    await pool.query('COMMIT')

    res.status(201).json(newProduct)
  } catch (err: any) {
    // This error check is no longer needed for product_id, but good to keep for other constraints
    if (err.code === "23505") {
      return res.status(409).json({ error: "A product with this identifier already exists." })
    }
    if (err.code === "23503") {
      return res.status(400).json({ error: "Invalid category_id or unit_id" })
    }
    throw err
  }
}

export async function updateProduct(req: Request, res: Response) {
  const id = req.params.id
  const { name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted, weight, weight_unit_id } = req.body as {
    name?: string
    description?: string | null
    category_id?: string | null
    unit_id?: string | null
    cost_price?: number
    selling_price?: number
    mrp?: number
    is_weighted?: boolean
    weight?: number
    weight_unit_id?: string
  }

  const { rows } = await pool.query(
    `UPDATE products
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         category_id = COALESCE($4, category_id),
         unit_id = COALESCE($5, unit_id),
         cost_price = COALESCE($6, cost_price),
         selling_price = COALESCE($7, selling_price),
         mrp = COALESCE($8, mrp),
         is_weighted = COALESCE($9, is_weighted),
         weight = COALESCE($10, weight),
         weight_unit_id = COALESCE($11, weight_unit_id)
     WHERE product_id = $1
     RETURNING product_id, name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted, weight, weight_unit_id, created_at`,
    [
      id,
      name ?? null,
      description ?? null,
      category_id ?? null,
      unit_id ?? null,
      cost_price ?? null,
      selling_price ?? null,
      mrp ?? null,
      is_weighted ?? null,
      weight,
      weight_unit_id,
    ],
  )
  if (!rows[0]) return res.status(404).json({ error: "Product not found" })
  res.json(rows[0])
}

export async function deleteProduct(req: Request, res: Response) {
  const id = req.params.id
  try {
    await pool.query("BEGIN")
    await pool.query(`DELETE FROM inventory WHERE product_id = $1`, [id])
    const result = await pool.query(`DELETE FROM products WHERE product_id = $1`, [id])
    await pool.query("COMMIT")
    if (result.rowCount === 0) return res.status(404).json({ error: "Product not found" })
    res.status(204).send()
  } catch (err) {
    await pool.query("ROLLBACK")
    throw err
  }
}

// import type { Request, Response } from "express"
// import { pool } from "../config/db.js"

// export async function listProducts(_req: Request, res: Response) {
//   const { rows } = await pool.query(
//     `SELECT
//        p.product_id,
//        p.name,
//        p.description,
//        p.category_id,
//        c.name AS category_name,
//        p.unit_id,
//        u.unit_name AS unit_name,
//        p.cost_price,
//        p.selling_price,
//        p.mrp,
//        p.is_weighted,
//        p.created_at,
//        COALESCE(SUM(i.stock_quantity), 0) AS stock_quantity
//      FROM products p
//      LEFT JOIN categories c ON c.category_id = p.category_id
//      LEFT JOIN units u ON u.unit_id = p.unit_id
//      LEFT JOIN inventory i ON i.product_id = p.product_id
//      GROUP BY p.product_id, c.name, u.unit_name
//      ORDER BY p.created_at DESC`,
//   )
//   res.json(rows)
// }

// export async function getProduct(req: Request, res: Response) {
//   const id = req.params.id
//   const { rows } = await pool.query(
//     `SELECT
//        p.product_id,
//        p.name,
//        p.description,
//        p.category_id,
//        c.name AS category_name,
//        p.unit_id,
//        u.unit_name AS unit_name,
//        p.cost_price,
//        p.selling_price,
//        p.mrp,
//        p.is_weighted,
//        p.created_at
//      FROM products p
//      LEFT JOIN categories c ON c.category_id = p.category_id
//      LEFT JOIN units u ON u.unit_id = p.unit_id
//      WHERE p.product_id = $1`,
//     [id],
//   )
//   if (!rows[0]) return res.status(404).json({ error: "Product not found" })
//   res.json(rows[0])
// }

// export async function createProduct(req: Request, res: Response) {
//   const {
//     product_id,
//     name,
//     description,
//     category_id,
//     unit_id,
//     cost_price,
//     selling_price,
//     mrp,
//     is_weighted = false,
//   } = req.body as {
//     product_id: string
//     name: string
//     description?: string | null
//     category_id?: number | null
//     unit_id?: number | null
//     cost_price: number
//     selling_price: number
//     mrp: number
//     is_weighted?: boolean
//   }

//   try {
//     const { rows } = await pool.query(
//       `INSERT INTO products
//        (product_id, name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//        RETURNING product_id, name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted, created_at`,
//       [
//         product_id,
//         name,
//         description ?? null,
//         category_id ?? null,
//         unit_id ?? null,
//         cost_price,
//         selling_price,
//         mrp,
//         is_weighted,
//       ],
//     )
//     res.status(201).json(rows[0])
//   } catch (err: any) {
//     if (err.code === "23505") {
//       return res.status(409).json({ error: "Product ID already exists" })
//     }
//     if (err.code === "23503") {
//       return res.status(400).json({ error: "Invalid category_id or unit_id" })
//     }
//     throw err
//   }
// }

// export async function updateProduct(req: Request, res: Response) {
//   const id = req.params.id
//   const { name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted } = req.body as {
//     name?: string
//     description?: string | null
//     category_id?: number | null
//     unit_id?: number | null
//     cost_price?: number
//     selling_price?: number
//     mrp?: number
//     is_weighted?: boolean
//   }

//   const { rows } = await pool.query(
//     `UPDATE products
//      SET name = COALESCE($2, name),
//          description = COALESCE($3, description),
//          category_id = COALESCE($4, category_id),
//          unit_id = COALESCE($5, unit_id),
//          cost_price = COALESCE($6, cost_price),
//          selling_price = COALESCE($7, selling_price),
//          mrp = COALESCE($8, mrp),
//          is_weighted = COALESCE($9, is_weighted)
//      WHERE product_id = $1
//      RETURNING product_id, name, description, category_id, unit_id, cost_price, selling_price, mrp, is_weighted, created_at`,
//     [
//       id,
//       name ?? null,
//       description ?? null,
//       category_id ?? null,
//       unit_id ?? null,
//       cost_price ?? null,
//       selling_price ?? null,
//       mrp ?? null,
//       is_weighted ?? null,
//     ],
//   )
//   if (!rows[0]) return res.status(404).json({ error: "Product not found" })
//   res.json(rows[0])
// }

// export async function deleteProduct(req: Request, res: Response) {
//   const id = req.params.id
//   const result = await pool.query(`DELETE FROM products WHERE product_id = $1`, [id])
//   if (result.rowCount === 0) return res.status(404).json({ error: "Product not found" })
//   res.status(204).send()
// }

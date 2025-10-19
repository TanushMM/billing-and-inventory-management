import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { randomUUID } from "crypto";

export async function listExpenseCategories(req: Request, res: Response) {
  const { rows } = await pool.query("SELECT * FROM expense_categories ORDER BY category_name");
  res.json(rows);
}

export async function createExpenseCategory(req: Request, res: Response) {
  const { category_name } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO expense_categories (category_id, category_name) VALUES ($1, $2) RETURNING *",
    [randomUUID(), category_name]
  );
  res.status(201).json(rows[0]);
}

export async function updateExpenseCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { category_name } = req.body;
  const { rows } = await pool.query(
    "UPDATE expense_categories SET category_name = $1 WHERE category_id = $2 RETURNING *",
    [category_name, id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Category not found" });
  }
  res.json(rows[0]);
}

export async function deleteExpenseCategory(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM expense_categories WHERE category_id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(204).send();
  } catch (error: any) {
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: "Cannot delete category as it is currently in use by an expense." });
    }
    throw error;
  }
}
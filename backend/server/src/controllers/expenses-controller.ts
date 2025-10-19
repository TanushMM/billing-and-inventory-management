import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { randomUUID } from "crypto";
import { ExpenseCreateInput } from "../schemas/expense-schemas.js";

export async function listExpenses(req: Request, res: Response) {
  const { rows } = await pool.query(`
    SELECT e.*, ec.category_name
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.expense_category_id = ec.category_id
    ORDER BY e.expense_date DESC
  `);
  res.json(rows);
}

export async function createExpense(req: Request, res: Response) {
  const { description, amount, expense_date, expense_category_id, notes } = req.body as ExpenseCreateInput;
  const { rows } = await pool.query(
    `INSERT INTO expenses (expense_id, description, amount, expense_date, expense_category_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [randomUUID(), description, amount, expense_date, expense_category_id, notes]
  );
  res.status(201).json(rows[0]);
}

export async function updateExpense(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;
  const user = req.user;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const oldExpenseRes = await client.query('SELECT * FROM expenses WHERE expense_id = $1 FOR UPDATE', [id]);
    if (oldExpenseRes.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    const oldExpense = oldExpenseRes.rows[0];

    // Log changes by comparing new data with old data
    for (const key in updates) {
      let oldValue = oldExpense[key];
      let newValue = updates[key];

      // Type-aware comparison
      let hasChanged = false;
      if (key === 'expense_date' && newValue) {
        // hasChanged = new Date(oldValue).toISOString().split('T')[0] !== new Date(newValue).toISOString().split('T')[0];
        hasChanged = new Date(oldValue).toISOString().substring(0, 10) !== new Date(newValue).toISOString().substring(0, 10);
      } else if (key === 'amount') {
        hasChanged = parseFloat(oldValue) !== parseFloat(newValue);
      } else if (oldValue !== newValue) {
        hasChanged = true;
      }
      if (hasChanged) {
        await client.query(
          `INSERT INTO expense_change_logs (log_id, expense_id, field_name, old_value, new_value, changed_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [randomUUID(), id, key, oldValue, newValue, user?.full_name || 'System']
        );
      }
    }
    // Dynamically build update query
    const updateFields = Object.keys(updates);
    const updateValues = Object.values(updates);
    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const { rows } = await client.query(
      `UPDATE expenses SET ${setClause} WHERE expense_id = $${updateFields.length + 1} RETURNING *`,
      [...updateValues, id]
    );

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
  
export async function deleteExpense(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM expenses WHERE expense_id = $1", [id]);
  res.status(204).send();
}

export async function getExpenseChangeLogs(req: Request, res: Response) {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM expense_change_logs WHERE expense_id = $1 ORDER BY changed_at DESC",
      [id]
    );
    res.json(rows);
}
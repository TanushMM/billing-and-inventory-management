import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import { randomUUID } from "crypto";
import { TransactionCreateInput } from "../schemas/transactions-schemas.js";

export async function createTransaction(req: Request, res: Response) {
  const { items, ...transactionData } = req.body as TransactionCreateInput;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert the main transaction record
    const transactionId = randomUUID();
    const transactionResult = await client.query(
      `INSERT INTO transactions (transaction_id, customer_id, total_amount, total_discount, final_amount, payment_method, change_due, customer_credit, is_reprinted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        transactionId,
        transactionData.customer_id,
        transactionData.total_amount,
        transactionData.total_discount,
        transactionData.final_amount,
        transactionData.payment_method,
        transactionData.change_due,
        transactionData.customer_credit,
        transactionData.is_reprinted,
      ]
    );

    // Insert transaction items and update inventory
    for (const item of items) {
      // Fetch product name for denormalization
      const productQuery = await client.query("SELECT name FROM products WHERE product_id = $1", [item.product_id]);
      const productName = productQuery.rows[0]?.name;
      if (!productName) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }
        
      const transactionItemId = randomUUID();
      await client.query(
        `INSERT INTO transaction_items (transaction_item_id, transaction_id, product_id, product_name, quantity, unit_price, item_total, item_discount, tax_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          transactionItemId,
          transactionId,
          item.product_id,
          productName,
          item.quantity,
          item.unit_price,
          item.item_total,
          item.item_discount,
          item.tax_rate,
        ]
      );

      // Update inventory
      await client.query(
        `UPDATE inventory SET stock_quantity = stock_quantity - $1 WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(transactionResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction failed:", err);
    res.status(500).json({ error: "Transaction failed", details: (err as Error).message });
  } finally {
    client.release();
  }
}
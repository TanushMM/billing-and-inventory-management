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

export async function listTransactions(req: Request, res: Response) {
  const { page = 1, limit = 10, filter, startDate, endDate } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  let whereClause = "";
  let countWhereClause = "";
  const queryParams = [limit, offset];

  if (filter === 'day') {
    whereClause = `WHERE t.transaction_date >= current_date`;
  } else if (filter === 'month') {
    whereClause = `WHERE t.transaction_date >= date_trunc('month', current_date)`;
  } else if (filter === 'year') {
    whereClause = `WHERE t.transaction_date >= date_trunc('year', current_date)`;
  } else if (filter === 'custom' && startDate && endDate) {
    queryParams.push(startDate as string, endDate as string);
    whereClause = `WHERE t.transaction_date::date BETWEEN $3 AND $4`;
    countWhereClause = `WHERE t.transaction_date::date BETWEEN $1 AND $2`;
  }

  const dataQuery = `
    SELECT
      t.transaction_id,
      t.transaction_date,
      t.final_amount,
      t.payment_method,
      c.name as customer_name
    FROM transactions t
    LEFT JOIN customers c ON t.customer_id = c.customer_id
    ${whereClause}
    ORDER BY t.transaction_date DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) FROM transactions t ${countWhereClause || whereClause}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, queryParams.slice(0, whereClause ? queryParams.length : 2)),
    pool.query(countQuery, (filter === 'custom' && startDate && endDate) ? queryParams.slice(2) : [])
  ]);

  const totalRecords = parseInt(countResult.rows[0].count, 10);
  res.json({ data: dataResult.rows, total: totalRecords });
}

export async function exportTransactions(req: Request, res: Response) {
  const { filter, startDate, endDate } = req.query;

  let whereClause = "";
  const queryParams = [];

  if (filter === 'day') {
    whereClause = `WHERE t.transaction_date >= current_date`;
  } else if (filter === 'month') {
    whereClause = `WHERE t.transaction_date >= date_trunc('month', current_date)`;
  } else if (filter === 'year') {
    whereClause = `WHERE t.transaction_date >= date_trunc('year', current_date)`;
  } else if (filter === 'custom' && startDate && endDate) {
    queryParams.push(startDate as string, endDate as string);
    whereClause = `WHERE t.transaction_date::date BETWEEN $1 AND $2`;
  }

  const query = `
    SELECT
      t.transaction_id,
      t.transaction_date,
      t.final_amount,
      t.payment_method,
      c.name as customer_name
    FROM transactions t
    LEFT JOIN customers c ON t.customer_id = c.customer_id
    ${whereClause}
    ORDER BY t.transaction_date DESC
  `;

  try {
    const result = await pool.query(query, queryParams);
    const transactions = result.rows;

    let csv = 'Transaction ID,Customer Name,Date,Payment Method,Final Amount\n';
    transactions.forEach(tx => {
      csv += `"${tx.transaction_id}","${tx.customer_name || 'N/A'}","${new Date(tx.transaction_date).toLocaleString()}","${tx.payment_method}","${tx.final_amount}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('sales-report.csv');
    res.send(csv);
  } catch (error) {
    console.error("Failed to export transactions:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
}

export async function createBulkTransactions(req: Request, res: Response) {
  const { date, totalAmount, paymentMethod } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find or create the 'Manual Entry' customer
    let customerRes = await client.query("SELECT customer_id FROM customers WHERE name = 'Manual Entry'");
    let customerId;
    if (customerRes.rows.length === 0) {
      const newCustomerId = randomUUID();
      await client.query(
        "INSERT INTO customers (customer_id, name) VALUES ($1, $2)",
        [newCustomerId, 'Manual Entry']
      );
      customerId = newCustomerId;
    } else {
      customerId = customerRes.rows[0].customer_id;
    }

    const transactionId = randomUUID();
    await client.query(
      `INSERT INTO transactions 
        (transaction_id, customer_id, transaction_date, total_amount, final_amount, payment_method, total_discount, change_due, customer_credit) 
       VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0)`,
      [
        transactionId,
        customerId,
        new Date(date),
        totalAmount,
        totalAmount,
        paymentMethod,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: `Transaction created successfully for ${date}.` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Bulk transaction creation failed:", error);
    res.status(500).json({ error: "Failed to create bulk transactions" });
  } finally {
    client.release();
  }
}
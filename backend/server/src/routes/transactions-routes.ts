import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { transactionCreateSchema, bulkTransactionCreateSchema } from "../schemas/transactions-schemas.js";
import { createTransaction, listTransactions, exportTransactions, createBulkTransactions } from "../controllers/transactions-controller.js";

export const transactionsRouter = Router();

transactionsRouter.get("/", listTransactions);
transactionsRouter.get("/export", exportTransactions);
transactionsRouter.post("/", validateBody(transactionCreateSchema), createTransaction);
transactionsRouter.post("/bulk", validateBody(bulkTransactionCreateSchema), createBulkTransactions);
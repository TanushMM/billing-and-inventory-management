import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { transactionCreateSchema } from "../schemas/transactions-schemas.js";
import { createTransaction, listTransactions, exportTransactions } from "../controllers/transactions-controller.js";

export const transactionsRouter = Router();

transactionsRouter.get("/", listTransactions);
transactionsRouter.get("/export", exportTransactions);
transactionsRouter.post("/", validateBody(transactionCreateSchema), createTransaction);
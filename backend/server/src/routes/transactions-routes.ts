import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { transactionCreateSchema } from "../schemas/transactions-schemas.js";
import { createTransaction } from "../controllers/transactions-controller.js";

export const transactionsRouter = Router();

transactionsRouter.post("/", validateBody(transactionCreateSchema), createTransaction);
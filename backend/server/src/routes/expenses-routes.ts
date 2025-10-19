import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { expenseSchema } from "../schemas/expense-schemas.js";
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseChangeLogs,
} from "../controllers/expenses-controller.js";

export const expensesRouter = Router();

expensesRouter.get("/", listExpenses);
expensesRouter.post("/", validateBody(expenseSchema), createExpense);
expensesRouter.put("/:id", validateBody(expenseSchema.partial()), updateExpense);
expensesRouter.delete("/:id", deleteExpense);
expensesRouter.get("/:id/changelog", getExpenseChangeLogs);
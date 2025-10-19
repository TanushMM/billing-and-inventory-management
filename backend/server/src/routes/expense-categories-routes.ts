import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { expenseCategorySchema } from "../schemas/expense-schemas.js";
import { listExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from "../controllers/expense-categories-controller.js";

export const expenseCategoriesRouter = Router();

expenseCategoriesRouter.get("/", listExpenseCategories);
expenseCategoriesRouter.post("/", validateBody(expenseCategorySchema), createExpenseCategory);
expenseCategoriesRouter.put("/:id", validateBody(expenseCategorySchema), updateExpenseCategory);
expenseCategoriesRouter.delete("/:id", deleteExpenseCategory);
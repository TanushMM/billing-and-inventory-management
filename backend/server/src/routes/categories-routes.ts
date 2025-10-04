import { Router } from "express"
import { validateBody } from "../middleware/validate.js"
import { categoryCreateSchema, categoryUpdateSchema } from "../schemas/category-schemas.js"
import { createCategory, deleteCategory, listCategories, updateCategory } from "../controllers/categories-controller.js"

export const categoriesRouter = Router()

categoriesRouter.get("/", listCategories)
categoriesRouter.post("/", validateBody(categoryCreateSchema), createCategory)
categoriesRouter.put("/:id", validateBody(categoryUpdateSchema), updateCategory)
categoriesRouter.delete("/:id", deleteCategory)

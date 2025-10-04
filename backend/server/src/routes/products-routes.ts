import { Router } from "express"
import { validateBody } from "../middleware/validate.js"
import { productCreateSchema, productUpdateSchema } from "../schemas/product-schemas.js"
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/products-controller.js"

export const productsRouter = Router()

productsRouter.get("/", listProducts)
productsRouter.get("/:id", getProduct)
productsRouter.post("/", validateBody(productCreateSchema), createProduct)
productsRouter.put("/:id", validateBody(productUpdateSchema), updateProduct)
productsRouter.delete("/:id", deleteProduct)

import { Router } from "express"
import { validateBody } from "../middleware/validate.js"
import { customerCreateSchema, customerUpdateSchema } from "../schemas/customer-schemas.js"
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from "../controllers/customers-controller.js"

export const customersRouter = Router()

customersRouter.get("/", listCustomers)
customersRouter.post("/", validateBody(customerCreateSchema), createCustomer)
customersRouter.put("/:id", validateBody(customerUpdateSchema), updateCustomer)
customersRouter.delete("/:id", deleteCustomer)
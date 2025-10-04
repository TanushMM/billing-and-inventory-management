import { Router } from "express"
import { upsertInventory, getInventoryByProduct, listInventory } from "../controllers/inventory-controller.js"
import { validateBody } from "../middleware/validate.js"
import { inventoryUpsertSchema } from "../schemas/inventory-schemas.js"

export const inventoryRouter = Router()

inventoryRouter.get("/", listInventory)
inventoryRouter.get("/:productId", getInventoryByProduct)
inventoryRouter.put("/:productId", validateBody(inventoryUpsertSchema), upsertInventory)

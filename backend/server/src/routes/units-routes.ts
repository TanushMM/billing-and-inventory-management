import { Router } from "express"
import { validateBody } from "../middleware/validate.js"
import { unitCreateSchema, unitUpdateSchema } from "../schemas/unit-schemas.js"
import { createUnit, deleteUnit, listUnits, updateUnit } from "../controllers/units-controller.js"

export const unitsRouter = Router()

unitsRouter.get("/", listUnits)
unitsRouter.post("/", validateBody(unitCreateSchema), createUnit)
unitsRouter.put("/:id", validateBody(unitUpdateSchema), updateUnit)
unitsRouter.delete("/:id", deleteUnit)

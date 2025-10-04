import { Router } from "express"
import { login } from "../controllers/auth-controller.js"
import { validateBody } from "../middleware/validate.ts"
import { loginSchema } from "../schemas/auth-schemas.js"

export const authRouter = Router()

authRouter.post("/login", validateBody(loginSchema), login)

import "dotenv/config"
import express from "express"
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan"
import { ENV } from "./config/env.js"
import { healthcheckDB } from "./config/db.js"
import { errorHandler, notFound } from "./middleware/error.js"
import { authRouter } from "./routes/auth-routes.js"
import { authenticateJWT } from "./middleware/auth.js"
import { productsRouter } from "./routes/products-routes.js"
import { categoriesRouter } from "./routes/categories-routes.js"
import { unitsRouter } from "./routes/units-routes.js"
import { inventoryRouter } from "./routes/inventory-routes.js"
import { customersRouter } from "./routes/customer-routes.js"
import { transactionsRouter } from "./routes/transactions-routes.js"
import { expensesRouter } from "./routes/expenses-routes.js"
import { expenseCategoriesRouter } from "./routes/expense-categories-routes.js"

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: "*", // adjust for your frontend domain in prod
    credentials: false,
  }),
)
app.use(express.json({ limit: "1mb" }))
app.use(morgan(ENV.NODE_ENV === "production" ? "combined" : "dev"))

app.get("/health", async (_req, res, next) => {
  try {
    const dbOk = await healthcheckDB()
    res.json({ ok: true, db: dbOk })
  } catch (e) {
    next(e)
  }
})

app.use("/api/auth", authRouter)

// Protect everything below
app.use("/api/products", authenticateJWT, productsRouter)
app.use("/api/categories", authenticateJWT, categoriesRouter)
app.use("/api/units", authenticateJWT, unitsRouter)
app.use("/api/inventory", authenticateJWT, inventoryRouter)
app.use("/api/customers", authenticateJWT, customersRouter)
app.use("/api/transactions", authenticateJWT, transactionsRouter)
app.use("/api/expenses", authenticateJWT, expensesRouter)
app.use("/api/expense-categories", authenticateJWT, expenseCategoriesRouter)

// 404 + error handler
app.use(notFound)
app.use(errorHandler)

app.listen(ENV.PORT, () => {
  console.log(`[server] Listening on http://localhost:${ENV.PORT}`)
})

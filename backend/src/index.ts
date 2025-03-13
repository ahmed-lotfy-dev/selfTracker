import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import authRouter from "./routes/auth.js"
import userRouter from "./routes/users.js"
import expensesRoute from "./routes/expenses.js"

import { authMiddleware } from "../middleware/middleware.js"

const app = new Hono()

app.use(logger())
app.use(cors())
app.route("/api/auth", authRouter)

app.use("/api/users", authMiddleware)
app.route("/api/users", userRouter)

app.use("/api/expenses", authMiddleware)
app.route("/api/expenses", expensesRoute)

app.get("/", async (c) => {
  return c.json({ message: "Hello world" })
})

app.get("/api/error", () => {
  throw new Error("error triggered")
})

app.onError((err, c) => {
  return c.json(
    {
      success: false,
      message: "An error occurred",
      error: err.message,
    },
    500
  )
})

serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT!),
})

console.log(process.env.PORT!)
console.log(`Server is running on http://localhost:${process.env.PORT}`)

import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import authRouter from "./routes/auth.js"
import userRouter from "./routes/users.js"
import expensesRouter from "./routes/expenses.js"
import weightsRouter from "./routes/weights.js"
import workoutRouter from "./routes/workouts.js"

import { authMiddleware } from "../middleware/middleware.js"

const app = new Hono()

app.use(
  cors({
    origin: "*", 
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
)

app.use(logger())

app.route("/api/auth", authRouter)

app.route("/api/users", userRouter)

app.route("/api/expenses", expensesRouter)

app.route("/api/weights", weightsRouter)

app.route("/api/workouts", workoutRouter)

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

export default {
  fetch: app.fetch,
  port: 5000,
}

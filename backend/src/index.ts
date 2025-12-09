import { Hono } from "hono"
import { cors } from "hono/cors"
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js"
import type { Logger } from "pino"

import userRouter from "./routes/users.js"
import expensesRouter from "./routes/expenses.js"
import tasksRouter from "./routes/tasks.js"
import weightsLogsRouter from "./routes/weightLogs.js"
import workoutsRouter from "./routes/workouts.js"
import workoutLogsRouter from "./routes/workoutsLogs.js"
import uploadRouter from "./routes/image.js"
import { auth } from "../lib/auth.js"

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    logger: Logger
  }
}>()

app.use(loggerMiddleware)

app.use(
  "*",
  cors({
    origin: [
      "http://192.168.1.5:8081",
      "exp://192.168.1.5:8081",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "UPDATE", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
)

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set("user", null)
    c.set("session", null)
    return next()
  }

  c.set("user", session.user)
  c.set("session", session.session)
  return next()
})

app.route("/api/users", userRouter)

app.route("/api/expenses", expensesRouter)

app.route("/api/tasks", tasksRouter)

app.route("/api/weightLogs", weightsLogsRouter)

app.route("/api/workouts", workoutsRouter)

app.route("/api/workoutLogs", workoutLogsRouter)

app.route("/api/image", uploadRouter)

app.get("/", async (c) => {
  return c.json({ message: "Hello world" })
})

app.get("/api/error", () => {
  throw new Error("error triggered")
})

app.onError((err, c) => {
  const logger = c.get("logger")
  if (logger) {
    logger.error(err)
  }
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
  port: process.env.PORT || 8000,
  hostname: "0.0.0.0",
  fetch: app.fetch,
  idleTimeout: 250,
}

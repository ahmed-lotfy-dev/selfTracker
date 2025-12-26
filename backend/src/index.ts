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
import timerRouter from "./routes/timer.js"
import electricRouter from "./routes/electric.js"
import desktopCallbackRouter from "./routes/desktopCallback.js"
import { auth } from "../lib/auth.js"
import { authMiddleware } from "./middlewares/authMiddleware.js"
import { Scalar } from '@scalar/hono-api-reference'
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'
import { openApiSpec } from "./docs/openapi.js"


const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    logger: Logger
  }
}>()


app.use(
  "*",
  cors({
    origin: [
      "http://192.168.1.5:8081",
      "http://localhost:1420", // Tauri
      "tauri://localhost", // Tauri Production
      "http://localhost:5173", // Vite local
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "UPDATE", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.use(loggerMiddleware)

// Public routes (before auth middleware)
app.route("/api/workouts", workoutsRouter) // Workout templates are public

// Auth middleware for all other API routes (except /api/auth/*)
app.use("/api/*", authMiddleware)

app.route("/api/users", userRouter)

app.route("/api/expenses", expensesRouter)

app.route("/api/tasks", tasksRouter)

app.route("/api/weightLogs", weightsLogsRouter)

app.route("/api/workoutLogs", workoutLogsRouter)

app.route("/api/timer", timerRouter)

app.route("/api/image", uploadRouter)

app.route("/api/electric", electricRouter)

app.route("/api", desktopCallbackRouter)

// API Reference & Documentation
app.get('/doc', (c) => c.json(openApiSpec))

app.get(
  '/scalar',
  Scalar({
    url: '/doc',
    theme: 'purple',
    pageTitle: 'SelfTracker API Reference'
  })
)

app.get('/llms.txt', async (c) => {
  try {
    const markdown = await createMarkdownFromOpenApi(JSON.stringify(openApiSpec))
    return c.text(markdown)
  } catch (e: any) {
    return c.text(`Error generating documentation: ${e.message}`, 500)
  }
})

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

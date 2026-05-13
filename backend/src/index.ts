import { Hono } from "hono"
import { cors } from "hono/cors"
import { requestLogger } from "./middlewares/requestLogger.js"
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
import habitsRouter from "./routes/habits.js"
import nutritionRouter from "./routes/nutrition.js"
import aiRouter from "./routes/ai.js"
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
      "http://localhost:8000", // Local backend
      "http://localhost:8081", // Expo dev
      "https://selftracker.ahmedlotfy.site", // Production
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "UPDATE", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Desktop OAuth proxy — system browser can GET this, sets cookie, redirects to provider
app.get("/api/auth/desktop/:provider", async (c) => {
  const { provider } = c.req.param()
  const callbackURL = c.req.query("callbackURL") || "selftracker://auth"
  try {
    // Build a synthetic POST to better-auth's sign-in endpoint
    // This is the only way to get the OAuth state cookie set in the system browser
    const body = JSON.stringify({ provider, callbackURL })
    const host = c.req.header("host") || "selftracker.ahmedlotfy.site"
    const url = `https://${host}/api/auth/sign-in/social`
    const headers = new Headers(c.req.raw.headers)
    headers.set("Content-Type", "application/json")
    headers.set("Origin", `https://${host}`)
    const synthetic = new Request(url, { method: "POST", headers, body })
    const authRes = await auth.handler(synthetic)
    const txt = await authRes.text()
    let data: any
    try { data = JSON.parse(txt) } catch { data = null }
    if (data?.url) {
      // Forward Set-Cookie (OAuth state) to the system browser
      const setCookie = authRes.headers.get("set-cookie")
      if (setCookie) c.header("Set-Cookie", setCookie)
      return c.redirect(data.url, 302)
    }
    return c.json({ error: "Failed to initiate OAuth", raw: txt }, 500)
  } catch (e: any) {
    console.error("[Desktop OAuth] Failed:", e)
    return c.html(`<html><body style="font-family:system-ui;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:20px;text-align:center;padding:20px"><h2 style="margin:0">Authentication Failed</h2><p style="color:#a1a1aa">${e?.message || "Could not initiate sign-in"}</p></body></html>`)
  }
})

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.use(requestLogger);

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

app.route("/api/habits", habitsRouter)

app.route("/api/nutrition", nutritionRouter)

app.route("/api/ai", aiRouter)

app.route("/api", desktopCallbackRouter)

// API Reference & Documentation
app.get('/openapi.json', (c) => c.json(openApiSpec))

app.get(
  '/docs',
  Scalar({
    url: '/openapi.json',
    theme: 'alternate',
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

// Background worker for creating embeddings from synced data
import { startEmbeddingWorker } from "./services/embeddingWorker.js"
startEmbeddingWorker()

export default {
  port: process.env.PORT || 8000,
  hostname: "0.0.0.0",
  fetch: app.fetch,
  idleTimeout: 250,
}

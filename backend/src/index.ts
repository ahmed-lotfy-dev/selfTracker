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
import projectsRouter from "./routes/projects.js"
import timerRouter from "./routes/timer.js"
import syncRouter from "./routes/sync.js"
import livestoreSyncRouter, { websocket as livestoreWS } from "./routes/livestore-sync.js"
import { auth } from "../lib/auth.js"
import { authMiddleware } from "./middlewares/authMiddleware.js"

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    logger: Logger
  }
}>()

app.use(loggerMiddleware)

// Auth middleware for all API routes (except /api/auth/*)
app.use("/api/*", authMiddleware)

app.use(
  "/api/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: [
      "http://192.168.1.5:8081",
      "exp://192.168.1.5:8081",
      "http://localhost:1420", // Tauri
      "http://localhost:5173", // Vite local
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "UPDATE", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// MAIN AUTH ROUTE (Double Star Wildcard for deep paths)
// MAIN AUTH ROUTE (Robust Wildcard matching)
app.all("/api/auth/:path*", (c) => {
  return auth.handler(c.req.raw);
});

app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/users", userRouter)

app.route("/api/expenses", expensesRouter)

app.route("/api/tasks", tasksRouter)

app.route("/api/weightLogs", weightsLogsRouter)

app.route("/api/workouts", workoutsRouter)

app.route("/api/workoutLogs", workoutLogsRouter)

app.route("/api/projects", projectsRouter)

app.route("/api/timer", timerRouter)

app.route("/api/image", uploadRouter)

app.route("/api/sync", syncRouter)

app.route("/api/livestore", livestoreSyncRouter)


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
  fetch(req: Request, server: any) {
    // Only upgrade if it's the specific sync path and a WS request
    const url = new URL(req.url);
    if (url.pathname === "/api/livestore/sync" && req.headers.get("upgrade") === "websocket") {
      console.log("[LiveStore] Upgrading WebSocket connection on /api/livestore/sync...");
      if (server.upgrade(req)) {
        return; // Bun handles it
      }
    }
    return app.fetch(req, server);
  },
  idleTimeout: 250,
  websocket: {
    message(ws: any, message: any) {
      livestoreWS.message(ws, message)
    },
    open(ws: any) {
      livestoreWS.open(ws)
    },
    close(ws: any) {
      livestoreWS.close(ws)
    },
  },
}

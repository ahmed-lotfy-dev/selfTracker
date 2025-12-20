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
      "http://localhost:1420", // Tauri
      "http://localhost:5173", // Vite local
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "UPDATE", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
)

app.get("/api/social-success", async (c) => {
  // This endpoint is now only used for DESKTOP OAuth
  // Mobile uses Better Auth Expo plugin's automatic callback handling

  // Get session to extract token
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });

  const token = session?.session.token;
  const platform = c.req.query('platform') || 'web';

  console.log('OAuth callback:', { platform, hasToken: !!token });

  // Desktop: return HTML that redirects to deep link and closes tab
  if (platform === 'desktop' || platform === 'mobile') {
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f8f9fa;
          }
          .message {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="message">
          <h2>✅ Authentication Successful</h2>
          <p>Returning to app...</p>
        </div>
        <script>
          window.location.href = 'selftracker://auth?token=${token || ''}';
          setTimeout(() => {
            window.close();
            setTimeout(() => {
              document.querySelector('.message').innerHTML = 
                '<h2>✅ Success!</h2><p>You can close this tab now.</p>';
            }, 500);
          }, 1000);
        </script>
      </body>
      </html>
    `);
  }

  // Web: redirect to dashboard
  return c.redirect('/', 302);
})

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

app.use("*", async (c, next) => {
  const headers = c.req.raw.headers;
  const authHeader = headers.get("Authorization");
  const cookieHeader = headers.get("Cookie");

  console.log(`[DEBUG_AUTH] Incoming Request: ${c.req.method} ${c.req.path}`);
  console.log(`[DEBUG_AUTH] Headers - Auth: ${authHeader ? 'YES' : 'NO'}, Cookie: ${cookieHeader ? 'YES' : 'NO'}`);

  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    console.warn(`[DEBUG_AUTH] Session is NULL for ${c.req.path}`);
    c.set("user", null)
    c.set("session", null)
    return next()
  }

  console.log(`[DEBUG_AUTH] Session Valid. User ID: ${session.user.id}`);

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

app.route("/api/projects", projectsRouter)

app.route("/api/timer", timerRouter)

app.route("/api/image", uploadRouter)

app.route("/api/sync", syncRouter)

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

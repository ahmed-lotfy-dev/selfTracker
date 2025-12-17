import { Hono } from "hono"
import { db } from "../db"
import { timerSessions } from "../db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "../../lib/auth"
import { logger } from "../lib/logger"

const timerRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}>()

// Middleware
timerRouter.use("*", async (c, next) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ success: false, message: "Unauthorized" }, 401)
  }
  await next()
})

// GET /api/timer/sessions - Get history
timerRouter.get("/sessions", async (c) => {
  const user = c.get("user")!
  const sessions = await db
    .select()
    .from(timerSessions)
    .where(eq(timerSessions.userId, user.id))
    .orderBy(desc(timerSessions.createdAt))
    .limit(50)

  return c.json({ success: true, data: sessions })
})

// POST /api/timer/sessions - Log a completed session
timerRouter.post("/sessions", async (c) => {
  const user = c.get("user")!
  try {
    const { taskId, startTime, endTime, duration, type, completed } = await c.req.json()

    // Ensure startTime is valid date object/string
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : null

    const [newSession] = await db
      .insert(timerSessions)
      .values({
        userId: user.id,
        taskId: taskId || null,
        startTime: start,
        endTime: end,
        duration: duration || 0,
        type: type || "focus",
        completed: completed ?? true,
      })
      .returning()

    return c.json({ success: true, data: newSession })
  } catch (error) {
    logger.error(error)
    return c.json({ success: false, message: "Failed to log session" }, 500)
  }
})

export default timerRouter

import { Hono } from "hono"
import { workoutLogs, workouts } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"
import { authMiddleware } from "../../middleware/middleware"
import { verify } from "hono/jwt"

const workoutRouter = new Hono()

workoutRouter.use(authMiddleware)

workoutRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  try {
    const userWorkoutLogs = await db
      .select({
        logId: workoutLogs.id, // Alias to avoid conflicts
        userId: workoutLogs.userId,
        workoutId: workoutLogs.workoutId,
        workoutName: workouts.name, // ✅ Get the workout name
        date: workoutLogs.date,
      })
      .from(workoutLogs)
      .leftJoin(workouts, eq(workoutLogs.workoutId, workouts.id)) // ✅ LEFT JOIN
      .where(eq(workoutLogs.userId, user.id as string))
    return c.json({ success: true, workouts: userWorkoutLogs })
  } catch (error) {
    console.error("JWT Verification Error:", error)
    return c.json({ message: "Invalid token!" }, 401)
  }
})

export default workoutRouter

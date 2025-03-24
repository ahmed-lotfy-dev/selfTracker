import { Hono } from "hono"
import { workoutLogs, workouts } from "../db/schema"
import { db } from "../db"
import { eq,desc,lt,and } from "drizzle-orm"
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

  const { cursor, limit = 10 } = c.req.query()

  try {
    const userWorkoutLogs = await db
      .select({
        logId: workoutLogs.id,
        userId: workoutLogs.userId,
        workoutId: workoutLogs.workoutId,
        workoutName: workouts.name,
        date: workoutLogs.date,
      })
      .from(workoutLogs)
      .leftJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
      .where(
        cursor
          ? and(
              eq(workoutLogs.userId, user.id as string),
              lt(workoutLogs.id, cursor) 
            )
          : eq(workoutLogs.userId, user.id as string) 
      )
      .orderBy(desc(workoutLogs.id)) 
      .limit(Number(limit)) 

    const nextCursor =
      userWorkoutLogs.length > 0
        ? userWorkoutLogs[userWorkoutLogs.length - 1].logId
        : null

    return c.json({
      success: true,
      workouts: userWorkoutLogs,
      nextCursor,
    })
  } catch (error) {
    console.error("Error fetching workout logs:", error)
    return c.json(
      { success: false, message: "Failed to fetch workout logs" },
      500
    )
  }
})

workoutRouter.get("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }
  const id = c.req.param("id")
  if (!id) {
    return c.json({ success: false, message: "ID is required" }, 400)
  }
  try {
    const singleWorkout = await db
      .select({
        logId: workoutLogs.id,
        userId: workoutLogs.userId,
        workoutId: workoutLogs.workoutId,
        workoutName: workouts.name,
        date: workoutLogs.date,
        notes: workoutLogs.notes,
        createdAt: workoutLogs.createdAt,
      })
      .from(workoutLogs)
      .leftJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
      .where(eq(workoutLogs.id, id))

    return c.json({ success: true, singleWorkout })
  } catch (error) {
    console.error("JWT Verification Error:", error)
    return c.json({ message: "Invalid token!" }, 401)
  }
})

export default workoutRouter

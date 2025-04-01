import { Hono } from "hono"
import { workoutLogs, workouts } from "../db/schema"
import { db } from "../db"
import { eq, desc, lt, and, not } from "drizzle-orm"
import { authMiddleware } from "../../middleware/middleware"
import { verify } from "hono/jwt"

const workoutLogsRouter = new Hono()

workoutLogsRouter.use(authMiddleware)

workoutLogsRouter.get("/", async (c) => {
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
        notes: workoutLogs.notes,
        createdAt: workoutLogs.createdAt,
      })
      .from(workoutLogs)
      .leftJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
      .where(
        cursor
          ? and(
              eq(workoutLogs.userId, user.id as string),
              lt(workoutLogs.createdAt, new Date(cursor))
            )
          : eq(workoutLogs.userId, user.id as string)
      )
      .orderBy(desc(workoutLogs.createdAt))
      .limit(Number(limit))

    const nextCursor =
      userWorkoutLogs.length > 0
        ? new Date(
            userWorkoutLogs[userWorkoutLogs.length - 1].createdAt ?? new Date()
          ).toISOString()
        : null

    return c.json({
      success: true,
      workoutLogs: userWorkoutLogs,
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

workoutLogsRouter.get("/:id", async (c) => {
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

workoutLogsRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const { workoutId, notes, createdAt } = await c.req.json()
  const parsedCreatedAt = createdAt ? new Date(createdAt) : new Date()

  if (!workoutId) {
    return c.json({ success: false, message: "Workout ID is required" }, 400)
  }

  try {
    const [newWorkoutLog] = await db
      .insert(workoutLogs)
      .values({
        userId: user.id,
        workoutId,
        notes: notes || null,
        createdAt: parsedCreatedAt,
      })
      .returning()

    return c.json({ success: true, workoutLog: newWorkoutLog })
  } catch (error) {
    console.error("Error creating workout log:", error)
    return c.json(
      { success: false, message: "Failed to create workout log" },
      500
    )
  }
})

workoutLogsRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const id = c.req.param("id")
  if (!id) {
    return c.json(
      { success: false, message: "Workout log ID is required" },
      400
    )
  }
  console.log({ id, user })
  const { notes, workoutId } = await c.req.json()

  try {
    const existingLog = await db.query.workoutLogs.findFirst({
      where: and(eq(workoutLogs.id, id), eq(workoutLogs.userId, user.id)),
    })

    if (!existingLog) {
      return c.json(
        {
          success: false,
          message:
            "Workout log not found or you are not authorized to update it",
        },
        404
      )
    }

    const updateFields: Record<string, any> = {}
    if (notes !== undefined) updateFields.notes = notes
    if (workoutId !== undefined) updateFields.workoutId = workoutId

    if (Object.keys(updateFields).length === 0) {
      return c.json(
        { success: false, message: "No valid fields provided for update" },
        400
      )
    }

    const [updatedWorkoutLog] = await db
      .update(workoutLogs)
      .set(updateFields)
      .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, user.id))) // Ensure user owns the log
      .returning()

    return c.json({
      success: true,
      message: "Workout log updated successfully",
      workoutLog: updatedWorkoutLog,
    })
  } catch (error) {
    console.error("Error updating workout log:", error)
    // Consider more specific error handling (e.g., foreign key constraint if workoutId is invalid)
    return c.json(
      { success: false, message: "Failed to update workout log" },
      500
    )
  }
})

workoutLogsRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const id = c.req.param("id")
  if (!id) {
    return c.json(
      { success: false, message: "Workout log ID is required" },
      400
    )
  }

  try {
    // Ensure the workout log belongs to the authenticated user
    const deletedWorkout = await db
      .delete(workoutLogs)
      .where(eq(workoutLogs.id, id))
      .returning({ deletedId: workoutLogs.id })

    if (deletedWorkout.length === 0) {
      return c.json({ success: false, message: "Workout log not found" }, 404)
    }

    return c.json({
      success: true,
      message: "Workout log deleted",
    })
  } catch (error) {
    console.error("Delete Workout Error:", error)
    return c.json(
      { success: false, message: "Failed to delete workout log" },
      500
    )
  }
})

export default workoutLogsRouter

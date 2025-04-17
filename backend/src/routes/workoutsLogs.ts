import { Hono } from "hono"
import { workoutLog, workout } from "../db/schema"
import { db } from "../db"
import { eq, desc, lt, and, not, gte, lte } from "drizzle-orm"
import { verify } from "hono/jwt"

const workoutLogsRouter = new Hono()

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
        id: workoutLog.id,
        userId: workoutLog.userId,
        workoutId: workoutLog.workoutId,
        workoutName: workout.name,
        notes: workoutLog.notes,
        createdAt: workoutLog.createdAt,
      })
      .from(workoutLog)
      .leftJoin(workout, eq(workoutLog.workoutId, workout.id))
      .where(
        cursor
          ? and(
              eq(workoutLog.userId, user.id as string),
              lt(workoutLog.createdAt, new Date(cursor))
            )
          : eq(workoutLog.userId, user.id as string)
      )
      .orderBy(desc(workoutLog.createdAt))
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

workoutLogsRouter.get("/calendar/:date", async (c) => {
  const user = c.get("user" as any)
  if (!user || !user.id) {
    return c.json({ success: false, message: "Unauthorized" }, 401)
  }

  const date = c.req.param("date")
  if (!date) {
    return c.json({ success: false, message: "Date is required" }, 400)
  }

  try {
    const startDate = new Date(date + "T00:00:00.000Z")
    const endDate = new Date(date + "T23:59:59.999Z")

    const [dateLog] = await db
      .select({
        id: workoutLog.id,
        userId: workoutLog.userId,
        workoutId: workoutLog.workoutId,
        workoutName: workout.name,
        notes: workoutLog.notes,
        createdAt: workoutLog.createdAt,
      })
      .from(workoutLog)
      .leftJoin(workout, eq(workoutLog.workoutId, workout.id))
      .where(
        and(
          gte(workoutLog.createdAt, startDate),
          lte(workoutLog.createdAt, endDate)
        )
      )
    return c.json({ success: true, logs: dateLog })
  } catch (error) {
    console.error("Error fetching calendar logs:", error)
    return c.json(
      { success: false, message: "Failed to fetch calendar logs" },
      500
    )
  }
})

workoutLogsRouter.get("/calendar", async (c) => {
  const user = c.get("user" as any)
  if (!user || !user.id) {
    return c.json({ success: false, message: "Unauthorized" }, 401)
  }

  const year = Number(c.req.query("year"))
  const month = Number(c.req.query("month"))

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return c.json({ success: false, message: "Invalid year or month" }, 400)
  }

  if (!year || !month) {
    return c.json(
      { success: false, message: "Year and month are required" },
      400
    )
  }

  try {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    console.log("Start Date:", startDate.toISOString())
    console.log("End Date:", endDate.toISOString())

    const logs = await db
      .select({
        id: workoutLog.id,
        userId: workoutLog.userId,
        workoutId: workoutLog.workoutId,
        workoutName: workout.name,
        notes: workoutLog.notes,
        createdAt: workoutLog.createdAt,
      })
      .from(workoutLog)
      .leftJoin(workout, eq(workoutLog.workoutId, workout.id))
      .where(
        and(
          eq(workoutLog.userId, user.id),
          and(
            gte(workoutLog.createdAt, startDate),
            lte(workoutLog.createdAt, endDate)
          )
        )
      )
      .orderBy(desc(workoutLog.createdAt))

    const groupedLogs: Record<string, any[]> = {}
    logs.forEach((log) => {
      const date = (log.createdAt as Date).toISOString().split("T")[0]
      if (!groupedLogs[date]) {
        groupedLogs[date] = []
      }
      groupedLogs[date].push(log)
    })

    return c.json({ success: true, logs: groupedLogs })
  } catch (error) {
    console.error("Error fetching calendar logs:", error)
    return c.json(
      { success: false, message: "Failed to fetch calendar logs" },
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
    const [singleWorkout] = await db
      .select({
        id: workoutLog.id,
        userId: workoutLog.userId,
        workoutId: workoutLog.workoutId,
        workoutName: workout.name,
        notes: workoutLog.notes,
        createdAt: workoutLog.createdAt,
      })
      .from(workoutLog)
      .leftJoin(workout, eq(workoutLog.workoutId, workout.id))
      .where(eq(workoutLog.id, id))

    return c.json({ success: true, logs: singleWorkout })
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

  const { workoutId, workoutName, notes, createdAt } = await c.req.json()
  const parsedCreatedAt = createdAt ? new Date(createdAt) : new Date()

  if (!workoutId) {
    return c.json({ success: false, message: "Workout ID is racequired" }, 400)
  }

  try {
    const [newWorkoutLog] = await db
      .insert(workoutLog)
      .values({
        userId: user.id,
        workoutId,
        notes: notes || null,
        createdAt: parsedCreatedAt,
        workoutName: workoutName || null,
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
  const id = c.req.param("id")

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }
  if (!id) {
    return c.json({ success: false, message: "Weight log ID is required" }, 400)
  }

  try {
    const existingLog = await db.query.workoutLog.findFirst({
      where: and(eq(workoutLog.id, id), eq(workoutLog.userId, user.id)),
    })

    if (!existingLog) {
      return c.json(
        {
          success: false,
          message: "Workout log not found",
        },
        404
      )
    }

    const body = await c.req.json()
    const updatedFields: Record<string, any> = {}

    if ("notes" in body) updatedFields.notes = body.notes
    if ("workoutId" in body) updatedFields.workoutId = body.workoutId
    if ("createdAt" in body) updatedFields.createdAt = new Date(body.createdAt)

    if (Object.keys(updatedFields).length === 0) {
      return c.json({ success: false, message: "No fields to update" }, 400)
    }

    const [updatedWorkoutLog] = await db
      .update(workoutLog)
      .set(updatedFields)
      .where(and(eq(workoutLog.id, id), eq(workoutLog.userId, user.id)))
      .returning()

    return c.json({
      success: true,
      message: "Workout log updated successfully",
      workoutLog: updatedWorkoutLog,
    })
  } catch (error) {
    console.error("Error updating workout log:", error)
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
    const deletedWorkout = await db
      .delete(workoutLog)
      .where(eq(workoutLog.id, id))
      .returning({ deletedId: workoutLog.id })

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

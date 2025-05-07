import { Hono } from "hono"
import { workoutLogs, workouts } from "../db/schema"
import { db } from "../db"
import { eq, desc, lt, and, not, gte, lte } from "drizzle-orm"
import { verify } from "hono/jwt"
import { getCache, setCache, clearCache } from "../../lib/redis"
import {
  createWorkoutLog,
  deleteWorkoutLog,
  getSingleWorkoutLog,
  getWorkoutLogsCalendar,
  updateWorkoutLog,
} from "../services/workoutLogsService"

const workoutLogsRouter = new Hono()

workoutLogsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }

  const { cursor, limit = 10 } = c.req.query()

  try {
    const cacheKey = `workoutLogs:list:${user.id}:${cursor ?? "first"}:${limit}`
    const cached = await getCache(cacheKey)
    if (cached) {
      if (cached.nextCursor) {
        return c.json({
          logs: cached.logs,
          nextCursor: cached.nextCursor,
        })
      }
    }

    const limitNumber = Number(limit) || 10

    const userWorkoutLogs = await db
      .select({
        id: workoutLogs.id,
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
      .limit(limitNumber + 1)

    const hasMore = userWorkoutLogs.length > limitNumber
    const items = hasMore ? userWorkoutLogs.slice(0, -1) : userWorkoutLogs
    const nextCursor = hasMore
      ? items[items.length - 1]?.createdAt?.toISOString()
      : null

    const responseData = {
      logs: items,
      nextCursor,
    }

    await setCache(cacheKey, 3600, responseData)

    return c.json(responseData)
  } catch (error) {
    console.error("Error fetching workout logs:", error)
    return c.json({ message: "Failed to fetch workout logs" }, 500)
  }
})

workoutLogsRouter.get("/calendar", async (c) => {
  const user = c.get("user" as any)
  if (!user || !user.id) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const year = Number(c.req.query("year"))
  const month = Number(c.req.query("month"))

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return c.json({ message: "Invalid year or month" }, 400)
  }

  if (!year || !month) {
    return c.json({ message: "Year and month are required" }, 400)
  }

  try {
    const calendarKey = `workoutLogs:calendar:${user.id}:${year}-${month}`
    const cached = await getCache(calendarKey)
    if (cached) {
      return c.json(JSON.parse(cached))
    }

    const logs = await getWorkoutLogsCalendar(year, month, user.id)

    await setCache(calendarKey, 3600, logs)

    return c.json({ logs: logs })
  } catch (error) {
    console.error("Error fetching calendar logs:", error)
    return c.json({ message: "Failed to fetch calendar logs" }, 500)
  }
})

workoutLogsRouter.get("/:id", async (c) => {
  const user = c.get("user" as any)
  const id = c.req.param("id")

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }
  if (!id) {
    return c.json({ message: "ID is required" }, 400)
  }

  try {
    const singleWorkout = await getSingleWorkoutLog(id)

    if (!singleWorkout) {
      return c.json({ message: "Workout log not found" }, 404)
    }

    return c.json({ logs: singleWorkout })
  } catch (error) {
    console.error("JWT Verification Error:", error)
    return c.json({ message: "Invalid token!" }, 401)
  }
})

workoutLogsRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }

  const body = await c.req.json()
  console.log(body)
  if (!body.workoutId) {
    return c.json({ message: "Workout ID is racequired" }, 400)
  }

  try {
    await clearCache([
      `userHomeData:${user.id}`,
      `workoutLogs:list:${user.id}:*`,
      `workoutLogs:calendar:${user.id}:*`,
    ])

    const created = await createWorkoutLog(user.id, body)

    return c.json({ message: "log created successfully", workoutLog: created })
  } catch (error) {
    console.error("Error creating workout log:", error)
    return c.json({ message: "Failed to create workout log" }, 500)
  }
})

workoutLogsRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)
  const id = c.req.param("id")

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }
  if (!id) {
    return c.json({ message: "Weight log ID is required" }, 400)
  }

  try {
    await clearCache([
      `userHomeData:${user.id}`,
      `workoutLogs:list:${user.id}:*`,
      `workoutLogs:calendar:${user.id}:*`,
    ])

    const existingLog = await db.query.workoutLogs.findFirst({
      where: and(eq(workoutLogs.id, id), eq(workoutLogs.userId, user.id)),
    })

    if (!existingLog) {
      return c.json(
        {
          message: "Workout log not found",
        },
        404
      )
    }

    const body = await c.req.json()
    const updatedFields: Record<string, any> = {}

    if ("notes" in body) updatedFields.notes = body.notes
    if ("workoutId" in body) updatedFields.workoutId = body.workoutId
    if ("workoutName" in body) updatedFields.workoutName = body.workoutName
    if ("createdAt" in body) updatedFields.createdAt = new Date(body.createdAt)

    if (Object.keys(updatedFields).length === 0) {
      return c.json({ message: "No fields to update" }, 400)
    }

    const updated = await updateWorkoutLog(id, user.id, updatedFields)

    return c.json({
      message: "log updated successfully",
      workoutLog: updated,
    })
  } catch (error) {
    console.error("Error updating workout log:", error)
    return c.json({ message: "Failed to update workout log" }, 500)
  }
})

workoutLogsRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }

  const id = c.req.param("id")
  if (!id) {
    return c.json({ message: "Workout log ID is required" }, 400)
  }

  try {
    await clearCache([
      `userHomeData:${user.id}`,
      `workoutLogs:list:${user.id}:*`,
      `workoutLogs:calendar:${user.id}:*`,
    ])

    const existingLog = await db.query.workoutLogs.findFirst({
      where: and(eq(workoutLogs.id, id), eq(workoutLogs.userId, user.id)),
    })

    if (!existingLog) {
      return c.json({ message: "Workout log not found" }, 404)
    }

    const deleted = await deleteWorkoutLog(user.id, id)

    if (deleted.length === 0) {
      return c.json({ message: "Workout log not found" }, 404)
    }

    return c.json({
      message: "log deleted successfully",
    })
  } catch (error) {
    console.error("Delete Workout Error:", error)
    return c.json({ message: "Failed to delete workout log" }, 500)
  }
})

export default workoutLogsRouter

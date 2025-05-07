import { Hono } from "hono"
import { weightLogs } from "../db/schema"
import { db } from "../db"
import { eq, and, lt, desc } from "drizzle-orm"
import { clearCache, getCache, setCache } from "../../lib/redis"
import {
  createWeightLog,
  deleteWeightLog,
  getSingleWeightLog,
  getWeightLogs,
  updateWeightLog,
} from "../services/weightLogsService"

const weightsLogsRouter = new Hono()

weightsLogsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }

  const { cursor, limit = 10 } = c.req.query()

  try {
    const cacheKey = `weightLogs:list:${user.id}:${cursor ?? "first"}:${limit}`
    const cached = await getCache(cacheKey)
    if (cached) {
      if (cached.nextCursor) {
        return c.json({
          logs: cached.logs,
          nextCursor: cached.nextCursor,
        })
      }
    }

    const { items, nextCursor } = await getWeightLogs(user.id, cursor, limit)

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

weightsLogsRouter.get("/:id", async (c) => {
  const user = c.get("user" as any)
  const id = c.req.param("id")

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }

  if (!id) {
    return c.json({ message: "ID is required" }, 400)
  }

  try {
    const log = await getSingleWeightLog(id)

    if (!log) {
      return c.json({ message: "Weight log not found" }, 404)
    }

    return c.json({ weightLog: log })
  } catch (error) {
    console.error("Error fetching single weight log:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

weightsLogsRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }
  const body = await c.req.json()
  const { weight, energy, mood, notes, createdAt } = body

  try {
    await clearCache([
      `userHomeData:${user.id}`,
      `weightLogs:list:${user.id}:*`,
    ])

    const created = await createWeightLog(user.id, body)

    return c.json({ message: "log created successfully", weightLog: created })
  } catch (error) {
    console.error("Error creating weight log:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

weightsLogsRouter.patch("/:id", async (c) => {
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
      `weightLogs:list:${user.id}:*`,
    ])

    const existingLog = await db.query.weightLogs.findFirst({
      where: eq(weightLogs.id, id),
    })

    if (!existingLog) {
      return c.json({ message: "Weight log not found" }, 404)
    }

    const body = await c.req.json()
    const updateFields: Record<string, any> = {}

    if ("weight" in body) updateFields.weight = body.weight
    if ("mood" in body) updateFields.mood = body.mood
    if ("energy" in body) updateFields.energy = body.energy
    if ("notes" in body) updateFields.notes = body.notes
    if ("createdAt" in body) updateFields.createdAt = new Date(body.createdAt)

    if (Object.keys(updateFields).length === 0) {
      return c.json({ message: "No fields to update" }, 400)
    }

    const updated = await updateWeightLog(id, user.id, updateFields)

    return c.json({
      message: "Weight log updated successfully",
      weightLog: updated,
    })
  } catch (error) {
    console.error("Error updating weight log:", error)
    return c.json({ message: "Failed to update weight log" }, 500)
  }
})

weightsLogsRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json({ message: "Unauthorized: User not found in context" }, 401)
  }

  const id = c.req.param("id")
  if (!id) {
    return c.json({ message: "Weight log ID is required" }, 400)
  }

  try {
    await clearCache([
      `userHomeData:${user.id}`,
      `weightLogs:list:${user.id}:*`,
    ])

    const existingLog = await db.query.weightLogs.findFirst({
      where: and(eq(weightLogs.id, id), eq(weightLogs.userId, user.id)),
    })

    if (!existingLog) {
      return c.json({ message: "Weight log not found" }, 404)
    }

    const deleteLog = await deleteWeightLog(user.id, id)

    if (!deleteLog) {
      return c.json({ message: "Weight log not found" }, 404)
    }

    return c.json({
      message: "Weight log deleted successfully",
    })
  } catch (error) {
    console.error("Delete Weight Error:", error)
    return c.json({ message: "Failed to delete weight log" }, 500)
  }
})

export default weightsLogsRouter

import { Hono } from "hono"
import { weightLogs } from "../db/schema"
import { db } from "../db"
import { eq, and, lt, desc } from "drizzle-orm"
import { getRedisClient } from "../../lib/redis"

const weightsLogsRouter = new Hono()

const redisClient = getRedisClient()

weightsLogsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const { cursor, limit = 10 } = c.req.query()

  const version = (await redisClient.get(`weightLogs:${user.id}:v`)) || "1"
  const listCacheKey = `weightLogs:${user.id}:v${version}:list:${
    cursor ?? "first"
  }:${limit}`

  const cached = await redisClient.get(listCacheKey)
  if (cached) {
    return c.json(JSON.parse(cached))
  }

  try {
    const limitNumber = Number(limit) || 10

    const userWeightLogs = await db
      .select({
        id: weightLogs.id,
        userId: weightLogs.userId,
        weight: weightLogs.weight,
        energy: weightLogs.energy,
        mood: weightLogs.mood,
        notes: weightLogs.notes,
        createdAt: weightLogs.createdAt,
      })
      .from(weightLogs)
      .where(
        cursor
          ? and(
              eq(weightLogs.userId, user.id as string),
              lt(weightLogs.createdAt, new Date(cursor))
            )
          : eq(weightLogs.userId, user.id as string)
      )
      .orderBy(desc(weightLogs.createdAt))
      .limit(limitNumber + 1)
      .prepare("userWeightLogs")
      .execute()

    const hasMore = userWeightLogs.length > limitNumber
    const items = userWeightLogs.slice(0, -1)
    const nextCursor = hasMore
      ? items[items.length - 1]?.createdAt?.toISOString()
      : null

    const responseData = {
      success: true,
      weightLogs: items,
      nextCursor,
    }
    await redisClient.setEx(listCacheKey, 3600, JSON.stringify(responseData))  

    return c.json(responseData)
  } catch (error) {
    console.error("Error fetching workout logs:", error)
    return c.json(
      { success: false, message: "Failed to fetch workout logs" },
      500
    )
  }
})

weightsLogsRouter.get("/:id", async (c) => {
  const user = c.get("user" as any)
  const id = c.req.param("id")

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  if (!id) {
    return c.json({ success: false, message: "ID is required" }, 400)
  }

  const cacheKey = `weightLogs:${user.id}:${id}`
  const cached = await redisClient.get(cacheKey)

  if (cached) {
    return c.json({
      success: true,
      weightLog: JSON.parse(cached),
    })
  }

  try {
    const [singleWeightLog] = await db
      .select({
        id: weightLogs.id,
        userId: weightLogs.userId,
        weight: weightLogs.weight,
        energy: weightLogs.energy,
        mood: weightLogs.mood,
        notes: weightLogs.notes,
        createdAt: weightLogs.createdAt,
      })
      .from(weightLogs)
      .where(eq(weightLogs.id, id))

    if (!singleWeightLog) {
      return c.json({ success: false, message: "Weight log not found" }, 404)
    }

    await redisClient.setEx(cacheKey, 36000, JSON.stringify(singleWeightLog))

    return c.json({ success: true, weightLog: singleWeightLog })
  } catch (error) {
    console.error("Error fetching single weight log:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

weightsLogsRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const { weight, mood, energy, notes, createdAt } = await c.req.json()
  const parsedCreatedAt = createdAt ? new Date(createdAt) : new Date()

  try {
    await redisClient.incr(`weightLogs:${user.id}:v`)

    const [newWeightLog] = await db
      .insert(weightLogs)
      .values({
        userId: user.id,
        weight,
        notes: notes || null,
        energy: energy || "Medium",
        mood: mood || "Okay",
        createdAt: parsedCreatedAt,
      })
      .returning()

    return c.json({ success: true, weightLog: newWeightLog })
  } catch (error) {
    console.error("Error creating weight log:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

weightsLogsRouter.patch("/:id", async (c) => {
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
    await redisClient.incr(`weightLogs:${user.id}:v`)

    const existingLog = await db.query.weightLogs.findFirst({
      where: eq(weightLogs.id, id),
    })

    if (!existingLog) {
      return c.json({ success: false, message: "Weight log not found" }, 404)
    }

    const body = await c.req.json()
    const updateFields: Record<string, any> = {}

    if ("weight" in body) updateFields.weight = body.weight
    if ("mood" in body) updateFields.mood = body.mood
    if ("energy" in body) updateFields.energy = body.energy
    if ("notes" in body) updateFields.notes = body.notes
    if ("createdAt" in body) updateFields.createdAt = new Date(body.createdAt)

    if (Object.keys(updateFields).length === 0) {
      return c.json({ success: false, message: "No fields to update" }, 400)
    }

    const [updatedWeightLog] = await db
      .update(weightLogs)
      .set(updateFields)
      .where(and(eq(weightLogs.id, id), eq(weightLogs.userId, user.id)))
      .returning()

    return c.json({
      success: true,
      message: "Weight log updated successfully",
      weightLog: updatedWeightLog,
    })
  } catch (error) {
    console.error("Error updating weight log:", error)
    return c.json(
      { success: false, message: "Failed to update weight log" },
      500
    )
  }
})

weightsLogsRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const id = c.req.param("id")
  if (!id) {
    return c.json({ success: false, message: "Weight log ID is required" }, 400)
  }

  try {
    await redisClient.incr(`weightLogs:${user.id}:v`)

    const existingLog = await db.query.weightLogs.findFirst({
      where: and(eq(weightLogs.id, id), eq(weightLogs.userId, user.id)),
    })

    if (!existingLog) {
      return c.json({ success: false, message: "Weight log not found" }, 404)
    }

    const deletedWeight = await db
      .delete(weightLogs)
      .where(eq(weightLogs.id, id))
      .returning({ deletedId: weightLogs.id })

    if (deletedWeight.length === 0) {
      return c.json({ success: false, message: "Weight log not found" }, 404)
    }

    return c.json({
      success: true,
      message: "Weight log deleted",
    })
  } catch (error) {
    console.error("Delete Weight Error:", error)
    return c.json(
      { success: false, message: "Failed to delete weight log" },
      500
    )
  }
})

export default weightsLogsRouter

import { Hono } from "hono"
import { weightLogs } from "../db/schema"
import { db } from "../db"
import { eq, and, lt, desc } from "drizzle-orm"
import { authMiddleware } from "../../middleware/middleware"

const weightsLogsRouter = new Hono()

weightsLogsRouter.use(authMiddleware)

weightsLogsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const { cursor, limit = 10 } = c.req.query()

  try {
    const userWeightLogs = await db
      .select({
        id: weightLogs.id,
        userId: weightLogs.userId,
        weight: weightLogs.weight,
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
      .limit(Number(limit))

    const nextCursor =
      userWeightLogs.length > 0
        ? new Date(
            userWeightLogs[userWeightLogs.length - 1].createdAt ?? new Date()
          ).toISOString()
        : null

    return c.json({
      success: true,
      weightLogs: userWeightLogs,
      nextCursor,
    })
  } catch (error) {
    console.error("Error fetching weight logs:", error)
    return c.json(
      { success: false, message: "Failed to fetch weight logs" },
      500
    )
  }
})

weightsLogsRouter.get("/:id", async (c) => {
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
    const singleWeightLog = await db
      .select({
        logId: weightLogs.id,
        userId: weightLogs.userId,
        weight: weightLogs.weight,
        notes: weightLogs.notes,
        createdAt: weightLogs.createdAt,
      })
      .from(weightLogs)
      .where(eq(weightLogs.id, id))

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

  const { weight, mood, energy, notes } = await c.req.json()

  try {
    const existingLog = await db.query.weightLogs.findFirst({
      where: and(eq(weightLogs.id, id), eq(weightLogs.userId, user.id)),
    })

    if (!existingLog) {
      return c.json(
        {
          success: false,
          message:
            "Weight log not found or you are not authorized to update it",
        },
        404
      )
    }

    const updateFields: Record<string, any> = {}
    if (weight !== undefined) updateFields.weight = weight
    if (mood !== undefined) updateFields.mood = mood
    if (energy !== undefined) updateFields.energy = energy
    if (notes !== undefined) updateFields.notes = notes

    if (Object.keys(updateFields).length === 0) {
      return c.json(
        { success: false, message: "No valid fields provided for update" },
        400
      )
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

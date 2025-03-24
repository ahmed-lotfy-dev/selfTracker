import { Hono } from "hono"
import { weightLogs } from "../db/schema"
import { db } from "../db"
import { eq, and, lt, desc } from "drizzle-orm"
import { authMiddleware } from "../../middleware/middleware"

const weightsRouter = new Hono()

weightsRouter.use(authMiddleware)

weightsRouter.get("/", async (c) => {
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
        date: weightLogs.date,
        notes: weightLogs.notes,
        createdAt: weightLogs.createdAt,
      })
      .from(weightLogs)
      .where(
        cursor
          ? and(
              eq(weightLogs.userId, user.id as string),
              lt(weightLogs.id, cursor)
            )
          : eq(weightLogs.userId, user.id as string)
      )
      .orderBy(desc(weightLogs.id))
      .limit(Number(limit))

    const nextCursor =
      userWeightLogs.length > 0
        ? userWeightLogs[userWeightLogs.length - 1].id
        : null

    return c.json({
      success: true,
      weights: userWeightLogs,
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

weightsRouter.get("/:id", async (c) => {
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
        date: weightLogs.date,
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

export default weightsRouter

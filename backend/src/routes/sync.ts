import { Hono } from "hono"
import { db } from "../db"
import { weightLogs, workoutLogs, tasks } from "../db/schema"
import { and, eq, gte, isNotNull, or } from "drizzle-orm"

const syncRouter = new Hono()

syncRouter.get("/pull", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const since = c.req.query("since")
  const sinceDate = since ? new Date(since) : new Date(0)

  const [weights, workouts, userTasks] = await Promise.all([
    db.select().from(weightLogs).where(
      and(eq(weightLogs.userId, user.id), gte(weightLogs.updatedAt, sinceDate))
    ),
    db.select().from(workoutLogs).where(
      and(eq(workoutLogs.userId, user.id), gte(workoutLogs.updatedAt, sinceDate))
    ),
    db.select().from(tasks).where(
      and(eq(tasks.userId, user.id), gte(tasks.updatedAt, sinceDate))
    ),
  ])

  const changes = [
    ...weights.map((w) => ({ ...w, tableName: "weight_logs" })),
    ...workouts.map((w) => ({ ...w, tableName: "workout_logs" })),
    ...userTasks.map((t) => ({ ...t, tableName: "tasks" })),
  ]

  return c.json({ changes, serverTime: new Date().toISOString() })
})

syncRouter.post("/push", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { changes } = await c.req.json()
  const now = new Date()

  for (const change of changes || []) {
    const { action, tableName, rowId, data } = change

    if (tableName === "weight_logs") {
      if (action === "INSERT") {
        await db.insert(weightLogs).values({ ...data, userId: user.id, updatedAt: now }).onConflictDoUpdate({
          target: weightLogs.id,
          set: { ...data, updatedAt: now },
        })
      } else if (action === "UPDATE") {
        await db.update(weightLogs).set({ ...data, updatedAt: now }).where(eq(weightLogs.id, rowId))
      } else if (action === "DELETE") {
        await db.update(weightLogs).set({ deletedAt: now, updatedAt: now }).where(eq(weightLogs.id, rowId))
      }
    }

    if (tableName === "workout_logs") {
      if (action === "INSERT") {
        await db.insert(workoutLogs).values({ ...data, userId: user.id, updatedAt: now }).onConflictDoUpdate({
          target: workoutLogs.id,
          set: { ...data, updatedAt: now },
        })
      } else if (action === "UPDATE") {
        await db.update(workoutLogs).set({ ...data, updatedAt: now }).where(eq(workoutLogs.id, rowId))
      } else if (action === "DELETE") {
        await db.update(workoutLogs).set({ deletedAt: now, updatedAt: now }).where(eq(workoutLogs.id, rowId))
      }
    }

    if (tableName === "tasks") {
      if (action === "INSERT") {
        await db.insert(tasks).values({ ...data, userId: user.id, updatedAt: now }).onConflictDoUpdate({
          target: tasks.id,
          set: { ...data, updatedAt: now },
        })
      } else if (action === "UPDATE") {
        await db.update(tasks).set({ ...data, updatedAt: now }).where(eq(tasks.id, rowId))
      } else if (action === "DELETE") {
        await db.update(tasks).set({ deletedAt: now, updatedAt: now }).where(eq(tasks.id, rowId))
      }
    }
  }

  return c.json({ success: true, processed: changes?.length || 0 })
})

export default syncRouter

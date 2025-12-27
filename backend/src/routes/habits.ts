
import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { db } from "../db/index.js"
import { habits } from "../db/schema/index"
import { eq, and } from "drizzle-orm"
import { clearCache, getCache, setCache } from "../../lib/redis.js"

const habitsRouter = new Hono()

// Schemas
const createHabitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  streak: z.number().optional().nullable(),
  completedToday: z.boolean().optional().nullable(),
  lastCompletedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  createdAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  updatedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  deletedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
})

const updateHabitSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  streak: z.number().optional().nullable(),
  completedToday: z.boolean().optional().nullable(),
  lastCompletedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  createdAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  updatedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
})

// GET /api/habits
habitsRouter.get("/", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const cacheKey = `habits:${user.id}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return c.json({ habits: cached })
    }

    const userHabits = await db.query.habits.findMany({
      where: eq(habits.userId, user.id),
    })

    await setCache(cacheKey, 3600, userHabits)

    return c.json({ habits: userHabits })
  } catch (error) {
    console.error("Error fetching habits:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// POST /api/habits
habitsRouter.post("/", zValidator("json", createHabitSchema), async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const body = c.req.valid("json")

  try {
    // Clear cache
    await clearCache(`habits:${user.id}`)
    await clearCache(`userHomeData:${user.id}`)

    const [newHabit] = await db
      .insert(habits)
      .values({
        id: body.id || crypto.randomUUID(),
        userId: user.id,
        name: body.name,
        description: body.description,
        color: body.color || "#000000",
        streak: body.streak || 0,
        completedToday: body.completedToday || false,
        lastCompletedAt: body.lastCompletedAt,
        createdAt: body.createdAt || new Date(),
        updatedAt: body.updatedAt || new Date(),
        deletedAt: body.deletedAt,
      })
      .onConflictDoUpdate({
        target: habits.id,
        set: {
          name: body.name,
          description: body.description,
          color: body.color,
          streak: body.streak,
          completedToday: body.completedToday,
          lastCompletedAt: body.lastCompletedAt,
          updatedAt: new Date(),
          deletedAt: body.deletedAt,
        },
      })
      .returning()

    return c.json({
      message: "Habit created successfully",
      habit: newHabit,
    })
  } catch (error) {
    console.error("Error creating habit:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// PATCH /api/habits/:id
habitsRouter.patch("/:id", zValidator("json", updateHabitSchema), async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = c.req.valid("json")

  try {
    const existingHabit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, user.id)),
    })

    if (!existingHabit) {
      return c.json({ message: "Habit not found" }, 404)
    }

    await clearCache(`habits:${user.id}`)
    await clearCache(`userHomeData:${user.id}`)

    const updatedFields: any = {}
    if (body.name !== undefined) updatedFields.name = body.name
    if (body.description !== undefined) updatedFields.description = body.description
    if (body.color !== undefined) updatedFields.color = body.color
    if (body.streak !== undefined) updatedFields.streak = body.streak
    if (body.completedToday !== undefined) updatedFields.completedToday = body.completedToday
    if (body.lastCompletedAt !== undefined) updatedFields.lastCompletedAt = body.lastCompletedAt
    if (body.updatedAt !== undefined) updatedFields.updatedAt = body.updatedAt

    const [updatedHabit] = await db
      .update(habits)
      .set(updatedFields)
      .where(eq(habits.id, id))
      .returning()

    return c.json({
      message: "Habit updated successfully",
      habit: updatedHabit,
    })
  } catch (error) {
    console.error("Error updating habit:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// DELETE /api/habits/:id
habitsRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  try {
    await clearCache(`habits:${user.id}`)
    await clearCache(`userHomeData:${user.id}`)

    const deleted = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning()

    if (deleted.length === 0) {
      return c.json({ message: "Habit not found" }, 404)
    }

    return c.json({ message: "Habit deleted successfully" })
  } catch (error) {
    console.error("Error deleting habit:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default habitsRouter

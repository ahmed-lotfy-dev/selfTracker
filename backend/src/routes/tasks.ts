import { Hono } from "hono"
import { db } from "../db/index.js"
import { tasks, users } from "../db/schema.js"
import { eq, and, lt, desc } from "drizzle-orm"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"
import { getRedisClient } from "../../lib/redis.js"
import { clearCache } from "../../lib/utility"

const tasksRouter = new Hono()

const redisClient = getRedisClient()

// Get all Tasks
tasksRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const cacheKey = `tasks:list:${user.id}`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      const parsedCache = JSON.parse(cached)
      if (parsedCache.nextCursor) {
        return c.json(parsedCache)
      }
    }

    const userTasks = await db.query.tasks.findMany({
      where: eq(tasks.userId, user.id as string),
      orderBy: desc(tasks.createdAt),
    })

    const responseData = {
      success: true,
      tasks: userTasks,
    }

    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      EX: 3600, // Cache for 1 hour
    })

    return c.json(responseData)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return c.json({ success: false, message: "Internal server error" }, 500)
  }
})

// Create Task
tasksRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { title, completed, dueDate, category } = await c.req.json()

  try {
    await clearCache(user.id, `userHomeData`)
    await clearCache(user.id, `tasks:list`)

    const [createdTask] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        title,
        completed,
        dueDate,
        category,
      })
      .returning()

    return c.json({
      success: true,
      message: "Task created successfully",
      task: createdTask,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return c.json({ success: false, message: "Internal server error" }, 500)
  }
})

// Update Task
tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)
  console.log(user)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  const { title, completed, dueDate, category } = await c.req.json()
  console.log()
  console.log(title, completed, dueDate, category)
  try {
    await clearCache(user.id, `userHomeData`)
    await clearCache(user.id, `tasks:list`)

    // Check if task exists and belongs to the user
    const taskExisted = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    })

    if (!taskExisted || taskExisted.userId !== user.id) {
      return c.json(
        { success: false, message: "Task not found or unauthorized" },
        404
      )
    }

    const updateFields: Record<string, any> = {}
    if (title) updateFields.title = title
    if (typeof completed !== "undefined") updateFields.completed = completed
    if (dueDate) updateFields.dueDate = dueDate
    if (category) updateFields.category = category

    // Update Task
    const [updatedTask] = await db
      .update(tasks)
      .set(updateFields)
      .where(eq(tasks.id, id))
      .returning()

    // Invalidate tasks cache for this user
    console.log(updateFields)

    return c.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Error updating task:", error)
    return c.json({ success: false, message: "Internal server error" }, 500)
  }
})

// Delete Task
tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  try {
    await clearCache(user.id, `userHomeData`)
    await clearCache(user.id, `tasks:list`)

    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning()

    if (!deletedTask) {
      return c.json({ message: "Task not found" }, 404)
    }

    return c.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    return c.json({ success: false, message: "Internal server error" }, 500)
  }
})

export default tasksRouter

import { Hono } from "hono"
import { db } from "../db/index.js"
import { tasks, users } from "../db/schema.js"
import { eq } from "drizzle-orm"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"
import { getRedisClient } from "../../lib/redis.js"

const tasksRouter = new Hono()

const redisClient = await getRedisClient()

// Get all Tasks
tasksRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const cacheKey = `user:${user.id}:tasks`

    const cached = await redisClient.get(cacheKey)
    if (cached) {
      return c.json({ success: "true", tasks: JSON.parse(cached) })
    }

    const userTasks = await db.query.tasks.findMany({
      where: eq(tasks.userId, user.userId as string),
    })
    if (!userTasks) {
      return c.json({ message: "No tasks found" }, 404)
    }

    await redisClient.setEx(cacheKey, 36000, JSON.stringify(userTasks))

    return c.json({ success: "true", tasks: userTasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return c.json({ success: "false", message: "Error fetching tasks" }, 500)
  }
})

// Create Task
tasksRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { title, description, completed, dueDate, category } =
    await c.req.json()

  try {
    const cacheKey = `user:${user.id}:tasks`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      await redisClient.del(cacheKey)
    }

    const [createdTask] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        title,
        description,
        completed,
        dueDate,
        category,
      })
      .returning()

    return c.json({
      success: "true",
      message: "Task created successfully",
      task: createdTask,
    })
  } catch (error) {
    console.error("Error creating Task:", error)
    return c.json({ success: "false", message: "Error creating Task" }, 500)
  }
})

// Update Task
tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  const { title, description, completed, dueDate, category } =
    await c.req.json()

  try {
    const cacheKey = `user:${user.id}:tasks`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      await redisClient.del(cacheKey)
    }

    // Check if task exists and belongs to the user
    const taskExisted = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    })

    if (!taskExisted || taskExisted.userId !== user.userId) {
      return c.json(
        { success: false, message: "Task not found or unauthorized" },
        404
      )
    }

    const updateFields: Record<string, any> = {}
    if (title !== undefined) updateFields.title = title
    if (description !== undefined) updateFields.description = description
    if (completed !== undefined) updateFields.completed = completed
    if (dueDate !== undefined) updateFields.dueDate = dueDate
    if (category !== undefined) updateFields.category = category

    // Update Task
    const [updatedTask] = await db
      .update(tasks)
      .set(updateFields)
      .where(eq(tasks.id, id))
      .returning()

    return c.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Error updating Task:", error)
    return c.json({ success: false, message: "Error updating Task" }, 500)
  }
})

// Delete Task
tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  try {
    const cacheKey = `user:${user.id}:tasks`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      await redisClient.del(cacheKey)
    }
    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning()

    if (!deletedTask) {
      return c.json({ message: "Task not found" }, 404)
    }
    return c.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting Task:", error)
    return c.json({ success: false, message: "Error deleting Task" }, 500)
  }
})

export default tasksRouter

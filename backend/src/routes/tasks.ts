import { Hono } from "hono"
import { db } from "../db/index.js"
import { tasks, users } from "../db/schema.js"
import { eq } from "drizzle-orm"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"
import { getRedisClient } from "../../lib/redis.js"

const tasksRouter = new Hono()

const redisClient = getRedisClient()

// Get all Tasks
tasksRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const userTasks = await db.query.tasks.findMany({
    where: eq(tasks.userId, user.id as string),
  })
  if (!userTasks) {
    return c.json({ message: "No tasks found" }, 404)
  }

  return c.json({ success: "true", tasks: userTasks })
})

// Create Task
tasksRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { title, description, completed, dueDate, category } =
    await c.req.json()

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
})

// Update Task
tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  const { title, description, completed, dueDate, category } =
    await c.req.json()

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
})

// Delete Task
tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  if (!id) return c.json({ message: "Task ID is required" }, 400)
  const [deletedTask] = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning()

  if (!deletedTask) {
    return c.json({ message: "Task not found" }, 404)
  }
  return c.json({ message: "Task deleted successfully" })
})

export default tasksRouter

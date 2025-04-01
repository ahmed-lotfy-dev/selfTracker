import { Hono } from "hono"
import { db } from "../db/index.js"
import { tasks, users } from "../db/schema.js"
import { eq } from "drizzle-orm"
import { authMiddleware } from "../../middleware/middleware.js"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"

const tasksRouter = new Hono()

tasksRouter.use(authMiddleware)

// Get all Tasks
tasksRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  const userTasks = await db.query.tasks.findMany({
    where: eq(tasks.userId, user.userId as string),
  })
  return c.json({ success: "true", tasks: userTasks })
})

// Create Task
tasksRouter.post("/", async (c) => {
  const user = c.get("user" as any)
  const { title, description, completed, dueDate, category } =
    await c.req.json()
  try {
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

  const { id } = c.req.param()

  const { title, description, completed, dueDate, category } =
    await c.req.json()

  try {
    if (!id) {
      return c.json({ success: false, message: "Task ID is required" }, 400)
    }

    // Check if task exists and belongs to the user
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    })

    if (!task || task.userId !== user.userId) {
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

  const id = c.req.param("id")

  const deletedUser = await db.delete(tasks).where(eq(tasks.id, id)).returning()

  if (!deletedUser.length) {
    return c.json({ message: "Task not found" }, 404)
  }

  return c.json({ message: "Task deleted successfully" })
})

export default tasksRouter

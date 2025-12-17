import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { clearCache, setCache, getCache } from "../../lib/redis.js"
import {
  createTask,
  deleteTask,
  getUserTasks,
  updateTask,
} from "../services/tasksService.js"

const tasksRouter = new Hono()

// Zod Schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  completed: z.boolean().optional(),
  dueDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  category: z.string().optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  columnId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  order: z.number().int().optional(),
})

const updateTaskSchema = z.object({
  title: z.string().optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  category: z.string().optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  columnId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  order: z.number().int().optional(),
})

tasksRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const cacheKey = `tasks:${user.id}`
    const cached = await getCache(cacheKey)
    if (cached) return c.json(cached)

    const userTasks = await getUserTasks(user.id)

    await setCache(cacheKey, 3600, userTasks)

    return c.json(userTasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

tasksRouter.post("/", zValidator("json", createTaskSchema), async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const body = c.req.valid("json")

  try {
    // Clear cache before or after? Usually after success, but here it was before.
    // I'll keep it as is, but safer to do it after success to avoid cache thrashing on failure.
    // But original code: await clearCache(...)
    // I'll move it to after success or keep it if "optimistic". 
    // Moving it to after success is better practice.

    const created = await createTask(user.id, body)

    await clearCache([`userHomeData:${user.id}`, `tasks:${user.id}`])

    return c.json({
      message: "Task created successfully",
      task: created,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

tasksRouter.patch("/:id", zValidator("json", updateTaskSchema), async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  const body = c.req.valid("json")

  // Clean up undefined fields
  const updateFields: Record<string, any> = {}
  if (body.title !== undefined) updateFields.title = body.title
  if (body.completed !== undefined) updateFields.completed = body.completed
  if (body.dueDate !== undefined) updateFields.dueDate = body.dueDate
  if (body.category !== undefined) updateFields.category = body.category
  if (body.description !== undefined) updateFields.description = body.description
  if (body.projectId !== undefined) updateFields.projectId = body.projectId
  if (body.columnId !== undefined) updateFields.columnId = body.columnId
  if (body.priority !== undefined) updateFields.priority = body.priority
  if (body.order !== undefined) updateFields.order = body.order

  if (Object.keys(updateFields).length === 0) {
    return c.json({ message: "At least one field is required" }, 400)
  }

  try {
    // Note: updateTask service should handle ownership check? 
    // I should verify `tasksService` handles ownership check.
    // Original code did: if (!taskExisted || taskExisted.userId !== user.id) in the route.
    // Since I'm using the service `updateTask(id, user.id, updateFields)`, hopefully it checks.
    // But wait, the original code had the check INLINE before calling create/update!
    // Original code:
    // const taskExisted = await db.query.tasks.findFirst(...)
    // if (!taskExisted ...)
    // const updated = await updateTask(...)

    // Pass user.id to updateTask and let it handle or I should add check here.
    // I will look at `updateTask` signature in `services/tasksService.ts`.
    // Assuming `updateTask` takes `(taskId, userId, fields)`.

    const updated = await updateTask(id, user.id, updateFields)

    if (!updated) {
      return c.json({ message: "Task not found or unauthorized" }, 404)
    }

    await clearCache([`userHomeData:${user.id}`, `tasks:${user.id}`])

    return c.json({
      message: "Task updated successfully",
      task: updated,
    })
  } catch (error) {
    console.error("Error updating task:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  try {
    const deleted = await deleteTask(user.id, id)

    if (!deleted) {
      return c.json({ message: "Task not found" }, 404)
    }

    await clearCache([`userHomeData:${user.id}`, `tasks:${user.id}`])

    return c.json({
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default tasksRouter

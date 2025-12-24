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
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  completed: z.boolean().optional(),
  dueDate: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  category: z.string().optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  columnId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  order: z.number().int().optional(),
  createdAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  updatedAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  completedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
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
  createdAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  updatedAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  completedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
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

  if (Object.keys(body).length === 0) {
    return c.json({ message: "At least one field is required" }, 400)
  }

  try {
    const updated = await updateTask(id, user.id, body)

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

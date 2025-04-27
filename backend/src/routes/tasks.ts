import { Hono } from "hono"
import { db } from "../db/index.js"
import { tasks, users } from "../db/schema/index"
import { eq, and, lt, desc } from "drizzle-orm"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"
import { clearCache, setCache, getCache } from "../../lib/redis.js"

const tasksRouter = new Hono()

tasksRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const cacheKey = `tasks:${user.id}`
    const cached = await getCache(cacheKey)
    if (cached) return c.json(JSON.parse(cached))

    const userTasks = await db.query.tasks.findMany({
      where: eq(tasks.userId, user.id as string),
      orderBy: desc(tasks.createdAt),
    })

    const responseData = {
      tasks: userTasks,
    }

    await setCache(cacheKey, 3600, responseData)

    return c.json(responseData)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

tasksRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { title, completed, dueDate, category } = await c.req.json()

  try {
    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`tasks:${user.id}`)

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
      message: "Task created successfully",
      task: createdTask,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return c.json({  message: "Internal server error" }, 500)
  }
})

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
    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`tasks:list:${user.id}`)

    const taskExisted = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    })

    if (!taskExisted || taskExisted.userId !== user.id) {
      return c.json(
        {  message: "Task not found or unauthorized" },
        404
      )
    }

    const updateFields: Record<string, any> = {}
    if (title) updateFields.title = title
    if (typeof completed !== "undefined") updateFields.completed = completed
    if (dueDate) updateFields.dueDate = dueDate
    if (category) updateFields.category = category

    const [updatedTask] = await db
      .update(tasks)
      .set(updateFields)
      .where(eq(tasks.id, id))
      .returning()

    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`tasks:${user.id}`)

    return c.json({
      message: "Task updated successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Error updating task:", error)
    return c.json({  message: "Internal server error" }, 500)
  }
})

tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  if (!id) return c.json({ message: "Task ID is required" }, 400)

  try {
    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`tasks:list:${user.id}`)

    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning()

    if (!deletedTask) {
      return c.json({ message: "Task not found" }, 404)
    }

    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`tasks:${user.id}`)

    return c.json({
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default tasksRouter

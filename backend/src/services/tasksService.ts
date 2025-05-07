import { and, desc, eq } from "drizzle-orm"
import { db } from "../db"
import { tasks } from "../db/schema"

export const getUserTasks = async (userId: string) => {
  const userTasks = await db.query.tasks.findMany({
    where: eq(tasks.userId, userId),
    orderBy: desc(tasks.createdAt),
  })

  return userTasks
}

export const createTask = async (userId: string, fields: any) => {
  const [created] = await db.insert(tasks).values(fields).returning()

  return created
}

export const updateTask = async (id: string, userId: string, fields: any) => {
  const [updated] = await db
    .update(tasks)
    .set(fields)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning()
    .prepare("updateTask")
    .execute()

  return updated
}

export const deleteTask = async (userId: string, taskId: string) => {
  const deleted = await db.delete(tasks).where(eq(tasks.id, taskId))

  return deleted
}

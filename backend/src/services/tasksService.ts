import { and, desc, eq, sql } from "drizzle-orm"
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
  return await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(tasks)
      .values({
        id: fields.id || crypto.randomUUID(),
        userId,
        projectId: fields.projectId,
        columnId: fields.columnId,
        title: fields.title,
        description: fields.description,
        completed: fields.completed ?? false,
        dueDate: fields.dueDate,
        priority: fields.priority || "medium",
        order: fields.order || 0,
        category: fields.category,
        createdAt: fields.createdAt || new Date(),
        updatedAt: fields.updatedAt || new Date(),
      })
      .returning()

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...created, txid: parseInt(txid) }
  })
}

export const updateTask = async (id: string, userId: string, fields: any) => {
  return await db.transaction(async (tx) => {
    const updateData: any = {}
    if (fields.title !== undefined) updateData.title = fields.title
    if (fields.description !== undefined) updateData.description = fields.description
    if (fields.completed !== undefined) updateData.completed = fields.completed
    if (fields.dueDate !== undefined) updateData.dueDate = fields.dueDate
    if (fields.priority !== undefined) updateData.priority = fields.priority
    if (fields.order !== undefined) updateData.order = fields.order
    if (fields.category !== undefined) updateData.category = fields.category
    if (fields.projectId !== undefined) updateData.projectId = fields.projectId
    if (fields.columnId !== undefined) updateData.columnId = fields.columnId
    if (fields.createdAt !== undefined) updateData.createdAt = fields.createdAt
    if (fields.updatedAt !== undefined) updateData.updatedAt = fields.updatedAt

    const [updated] = await tx
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning()

    if (!updated) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...updated, txid: parseInt(txid) }
  })
}

export const deleteTask = async (userId: string, taskId: string) => {
  return await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning()

    if (!deleted) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...deleted, txid: parseInt(txid) }
  })
}


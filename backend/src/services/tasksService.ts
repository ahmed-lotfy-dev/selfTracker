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
        ...fields,
        id: fields.id || crypto.randomUUID(), // Client-generated ID preferred
        userId,
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
    const [updated] = await tx
      .update(tasks)
      .set(fields)
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


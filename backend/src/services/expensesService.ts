import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../db"
import { expenses } from "../db/schema"

export const getUserExpenses = async (userId: string) => {
  const userExpenses = await db.query.expenses.findMany({
    where: eq(expenses.userId, userId),
    orderBy: desc(expenses.createdAt),
  })

  return userExpenses
}

export const createExpense = async (userId: string, fields: any) => {
  return await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(expenses)
      .values({ ...fields, userId })
      .returning()

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...created, txid: parseInt(txid) }
  })
}

export const updateExpense = async (
  id: string,
  userId: string,
  fields: any
) => {
  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(expenses)
      .set(fields)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning()

    if (!updated) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...updated, txid: parseInt(txid) }
  })
}

export const deleteExpense = async (userId: string, ExpenseId: string) => {
  return await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(expenses)
      .where(and(eq(expenses.id, ExpenseId), eq(expenses.userId, userId)))
      .returning()

    if (!deleted) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...deleted, txid: parseInt(txid) }
  })
}


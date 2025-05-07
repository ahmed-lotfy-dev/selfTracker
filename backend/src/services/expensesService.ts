import { and, desc, eq } from "drizzle-orm"
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
  const [created] = await db.insert(expenses).values(fields).returning()

  return created
}

export const updateExpense = async (
  id: string,
  userId: string,
  fields: any
) => {
  const [updated] = await db
    .update(expenses)
    .set(fields)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning()
    .prepare("updateExpens")
    .execute()

  return updated
}

export const deleteExpense = async (userId: string, ExpenseId: string) => {
  const deleted = await db.delete(expenses).where(eq(expenses.id, ExpenseId))

  return deleted
}

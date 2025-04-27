import { Hono } from "hono"
import { db } from "../db/index.js"
import { expenses, users } from "../db/schema/index"
import { eq } from "drizzle-orm"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"
import { clearCache, getCache, setCache } from "../../lib/redis.js"

const expensesRouter = new Hono()

expensesRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const cacheKey = `expenses:${user.id}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return c.json({ expenses: cached })
    }

    const userExpenses = await db.query.expenses.findMany({
      where: eq(expenses.userId, user.id),
    })

    if (!userExpenses) {
      return c.json({ message: "No expenses found" }, 404)
    }

    const responseData = {
      expenses: userExpenses,
    }

    await setCache(cacheKey, 3600, responseData)

    return c.json(responseData)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

expensesRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { description, amount, category } = await c.req.json()

  if (!description || !amount || !category) {
    return c.json({ message: "All fields are required" }, 400)
  }

  const [createdExpense] = await db
    .insert(expenses)
    .values({
      userId: user.id,
      description,
      amount,
      category,
    })
    .returning()

  await clearCache(`userHomeData:${user.id}`)
  await clearCache(`expenses:${user.id}`)

  return c.json({
    message: "Expense created successfully",
    expense: createdExpense,
  })
})

expensesRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()

  if (!id) {
    return c.json({ message: "Expense ID is required" }, 400)
  }

  const { title, description, amount, category } = await c.req.json()
  if (!title && !description && !amount && !category) {
    return c.json({ message: "At least one field is required" }, 400)
  }

  const expenseExist = await db.query.expenses.findFirst({
    where: eq(expenses.id, id),
  })

  if (!expenseExist || expenseExist.userId !== user.userId) {
    return c.json({ message: "Expense not found or unauthorized" }, 404)
  }

  const updateFields: Record<string, any> = {}
  if (description !== undefined) updateFields.description = description
  if (amount !== undefined) updateFields.amount = amount
  if (category !== undefined) updateFields.category = category

  const [updatedExpense] = await db
    .update(expenses)
    .set(updateFields)
    .where(eq(expenses.id, id))
    .returning()

  await clearCache(`userHomeData:${user.id}`)
  await clearCache(`expenses:${user.id}`)

  return c.json({
    message: "Expense updated successfully",
    expense: updatedExpense,
  })
})

expensesRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  if (!id) {
    return c.json({ message: "Expense ID is required" }, 400)
  }

  const deletedExpense = await db
    .delete(expenses)
    .where(eq(expenses.id, id))
    .returning()

  if (!deletedExpense.length) {
    return c.json({ message: "Expense not found" }, 404)
  }

  await clearCache(`userHomeData:${user.id}`)
  await clearCache(`expenses:${user.id}`)

  return c.json({ message: "Expense deleted successfully" })
})

export default expensesRouter

import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { db } from "../db/index.js"
import { expenses } from "../db/schema/index"
import { eq, and } from "drizzle-orm"
import { clearCache, getCache, setCache } from "../../lib/redis.js"

const expensesRouter = new Hono()

const createExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().or(z.number()).transform((val) => String(val)),
  category: z.string().min(1, "Category is required"),
  createdAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
  updatedAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
})

const updateExpenseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  amount: z.string().or(z.number()).transform((val) => String(val)).optional(),
  category: z.string().optional(),
  updatedAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
})

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

expensesRouter.post("/", zValidator("json", createExpenseSchema), async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const body = c.req.valid("json")
  const { description, amount, category } = body

  const [createdExpense] = await db
    .insert(expenses)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      description,
      amount,
      category,
      createdAt: body.createdAt || new Date(),
      updatedAt: body.updatedAt || new Date(),
    })
    .returning()

  await clearCache(`userHomeData:${user.id}`)
  await clearCache(`expenses:${user.id}`)

  return c.json({
    message: "Expense created successfully",
    expense: createdExpense,
  })
})

expensesRouter.patch("/:id", zValidator("json", updateExpenseSchema), async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()

  if (!id) {
    return c.json({ message: "Expense ID is required" }, 400)
  }

  const { description, amount, category } = c.req.valid("json")

  if (description === undefined && amount === undefined && category === undefined) {
    return c.json({ message: "At least one field is required" }, 400)
  }

  const expenseExist = await db.query.expenses.findFirst({
    where: eq(expenses.id, id),
  })

  if (!expenseExist || expenseExist.userId !== user.id) {
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
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
    .returning()

  if (!deletedExpense.length) {
    return c.json({ message: "Expense not found" }, 404)
  }

  await clearCache(`userHomeData:${user.id}`)
  await clearCache(`expenses:${user.id}`)

  return c.json({ message: "Expense deleted successfully" })
})

export default expensesRouter

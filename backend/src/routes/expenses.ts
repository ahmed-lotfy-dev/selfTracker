import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { db } from "../db/index.js"
import { expenses } from "../db/schema/index"
import { eq, and } from "drizzle-orm"
import { clearCache, getCache, setCache } from "../../lib/redis.js"
import {
  createExpense,
  deleteExpense,
  getUserExpenses,
  updateExpense,
} from "../services/expensesService"

const expensesRouter = new Hono()

const createExpenseSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  amount: z.string().or(z.number()).transform((val) => String(val)),
  category: z.string().min(1, "Category is required"),
  createdAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  updatedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  deletedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
})

const updateExpenseSchema = z.object({
  description: z.string().optional(),
  amount: z.string().or(z.number()).transform((val) => String(val)).optional(),
  category: z.string().optional(),
  createdAt: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
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

  try {
    const created = await createExpense(user.id, body)

    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`expenses:${user.id}`)

    return c.json({
      message: "Expense created successfully",
      expense: created,
    })
  } catch (error) {
    console.error("Error creating expense:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

expensesRouter.patch("/:id", zValidator("json", updateExpenseSchema), async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()
  const body = c.req.valid("json")

  if (Object.keys(body).length === 0) {
    return c.json({ message: "At least one field is required" }, 400)
  }

  try {
    const updated = await updateExpense(id, user.id, body)

    if (!updated) {
      return c.json({ message: "Expense not found or unauthorized" }, 404)
    }

    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`expenses:${user.id}`)

    return c.json({
      message: "Expense updated successfully",
      expense: updated,
    })
  } catch (error) {
    console.error("Error updating expense:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

expensesRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  try {
    const deleted = await deleteExpense(user.id, id)

    if (!deleted) {
      return c.json({ message: "Expense not found" }, 404)
    }

    await clearCache(`userHomeData:${user.id}`)
    await clearCache(`expenses:${user.id}`)

    return c.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default expensesRouter

import { Hono } from "hono"
import { db } from "../db/index.js"
import { expenses, users } from "../db/schema.js"
import { eq } from "drizzle-orm"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"
import { getRedisClient } from "../../lib/redis.js"

const expensesRouter = new Hono()

const redisClient = await getRedisClient()

// Get all Expenses
expensesRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const cacheKey = `expenses:${user.id}`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      return c.json({ success: "true", expenses: JSON.parse(cached) })
    }

    const userExpenses = await db.query.expenses.findMany({
      where: eq(expenses.userId, user.id),
    })

    if (!userExpenses) {
      return c.json({ message: "No expenses found" }, 404)
    }

    await redisClient.setEx(cacheKey, 36000, JSON.stringify(userExpenses))

    return c.json({ success: "true", expenses: userExpenses })
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return c.json({ success: "false", message: "Error fetching expenses" }, 500)
  }
})

// Create Expense
expensesRouter.post("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { description, amount, category } = await c.req.json()

  if (!description || !amount || !category) {
    return c.json({ success: "false", message: "All fields are required" }, 400)
  }

  try {
    const cacheKey = `expenses:${user.id}`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      await redisClient.del(cacheKey)
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

    return c.json({
      success: "true",
      message: "Expense created successfully",
      expense: createdExpense,
    })
  } catch (error) {
    console.error("Error creating Expense:", error)
    return c.json({ success: "false", message: "Error creating Expense" }, 500)
  }
})

// Update Expense
expensesRouter.patch("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()

  if (!id) {
    return c.json({ success: false, message: "Expense ID is required" }, 400)
  }

  const { title, description, amount, category } = await c.req.json()
  if (!title && !description && !amount && !category) {
    return c.json(
      { success: false, message: "At least one field is required" },
      400
    )
  }

  try {
    const cacheKey = `expenses:${user.id}`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      await redisClient.del(cacheKey)
    }

    // Check if expense exists and belongs to the user
    const expenseExist = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    })

    if (!expenseExist || expenseExist.userId !== user.userId) {
      return c.json(
        { success: false, message: "Expense not found or unauthorized" },
        404
      )
    }

    const updateFields: Record<string, any> = {}
    if (description !== undefined) updateFields.description = description
    if (amount !== undefined) updateFields.amount = amount
    if (category !== undefined) updateFields.category = category

    // Update Expense
    const [updatedExpense] = await db
      .update(expenses)
      .set(updateFields)
      .where(eq(expenses.id, id))
      .returning()

    return c.json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    })
  } catch (error) {
    console.error("Error updating Expense:", error)
    return c.json({ success: false, message: "Error updating Expense" }, 500)
  }
})

// Delete Expense
expensesRouter.delete("/:id", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  if (!id) {
    return c.json({ message: "Expense ID is required" }, 400)
  }

  try {
    const cacheKey = `expenses:${user.id}`
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      await redisClient.del(cacheKey)
    }

    const deletedExpense = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning()

    if (!deletedExpense.length) {
      return c.json({ message: "Expense not found" }, 404)
    }

    return c.json({ message: "Expense deleted successfully" })
  } catch (error) {}
})

export default expensesRouter

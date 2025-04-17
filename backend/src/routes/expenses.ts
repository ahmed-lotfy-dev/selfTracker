import { Hono } from "hono"
import { db } from "../db/index.js"
import { expense, user } from "../db/schema.js"
import { eq } from "drizzle-orm"
import { sign } from "hono/jwt"
import { hash } from "bcryptjs"

const expensesRouter = new Hono()

// Get all Expenses
expensesRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  const userExpenses = await db.query.expense.findMany({
    where: eq(expense.userId, user.userId as string),
  })
  return c.json({ success: "true", expenses: userExpenses })
})

// Create Expense
expensesRouter.post("/", async (c) => {
  const user = c.get("user" as any)
  const { title, description, amount, category } = await c.req.json()
  try {
    const [createdExpense] = await db
      .insert(expense)
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

  const { id } = c.req.param()

  const { title, description, amount, category } = await c.req.json()

  try {
    if (!id) {
      return c.json({ success: false, message: "Expense ID is required" }, 400)
    }

    // Check if expense exists and belongs to the user
    const expenseExist = await db.query.expense.findFirst({
      where: eq(expense.id, id),
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
      .update(expense)
      .set(updateFields)
      .where(eq(expense.id, id))
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

  const id = c.req.param("id")

  const deletedExpense = await db
    .delete(expense)
    .where(eq(expense.id, id))
    .returning()
  console.log(deletedExpense)
  if (!deletedExpense.length) {
    return c.json({ message: "Expense not found" }, 404)
  }

  return c.json({ message: "Expense deleted successfully" })
})

export default expensesRouter

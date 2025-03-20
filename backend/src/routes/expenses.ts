import { Hono } from "hono"
import { authMiddleware } from "../../middleware/middleware"
import { db } from "../db"
import { eq } from "drizzle-orm"
import { expenses } from "../db/schema"

const expensesRouter = new Hono()

expensesRouter.use(authMiddleware)

expensesRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  const expensesList = await db.query.expenses.findMany({
    where: eq(expenses.userId, user.userId as string),
  })
  return c.json({ success: "true", expenses: expensesList })
})

export default expensesRouter

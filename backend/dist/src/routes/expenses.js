import { Hono } from "hono";
import { authMiddleware } from "../../middleware/middleware";
import { db } from "../db";
import { verify } from "hono/jwt";
import { eq } from "drizzle-orm";
import { expenses } from "../db/schema";
const expensesRoute = new Hono();
expensesRoute.use("*", authMiddleware);
expensesRoute.get("/", async (c) => {
    const user = c.get("user");
    const expensesList = await db.query.expenses.findMany({
        where: eq(expenses.userId, user.userId),
    });
    return c.json({ success: "true", expenses: expensesList });
});
export default expensesRoute;

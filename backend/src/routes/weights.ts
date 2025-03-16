import { Hono } from "hono"
import { weightLogs } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"

const weightsRouter = new Hono()

weightsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const weightsList = await db.query.weightLogs.findMany({
    where: eq(weightLogs.userId, user.id as string),
  })

  return c.json({ success: true, weights: weightsList })
})

export default weightsRouter

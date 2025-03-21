import { Hono } from "hono"
import { weightLogs } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"
import { authMiddleware } from "../../middleware/middleware"

const weightsRouter = new Hono()

weightsRouter.use(authMiddleware)

weightsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  try {
    const weightsLogs = await db.query.weightLogs.findMany({
      where: eq(weightLogs.userId, user.id as string),
    })
    return c.json({ success: true,weights: weightsLogs })
  } catch (error) {
    console.error("JWT Verification Error:", error)
    return c.json({ message: "Invalid token!" }, 401)
  }
})

export default weightsRouter

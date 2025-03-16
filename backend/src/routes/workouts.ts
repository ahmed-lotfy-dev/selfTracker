import { Hono } from "hono"
import { workoutLogs } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"

const workoutRouter = new Hono()

workoutRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user || !user.id) {
    return c.json(
      { success: false, message: "Unauthorized: User not found in context" },
      401
    )
  }

  const workoutList = await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.userId, user.id as string),
  })

  return c.json({ success: true, workouts: workoutList })
})
export default workoutRouter

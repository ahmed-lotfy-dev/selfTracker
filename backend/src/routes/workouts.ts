import { Hono } from "hono"
import { db } from "../db"
import { workouts } from "../db/schema"
import { getRedisClient } from "../../lib/redis"

const workoutsRouter = new Hono()

const redisClient = getRedisClient()

workoutsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const userWorkouts = await db.query.workouts.findMany()

  if (userWorkouts.length === 0) {
    return c.json({ message: "No workouts found" }, 404)
  }
  return c.json({ success: "true", workouts: userWorkouts })
})

export default workoutsRouter

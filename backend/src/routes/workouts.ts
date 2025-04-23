import { Hono } from "hono"
import { db } from "../db"
import { workouts } from "../db/schema"
import { redisClient } from "../../lib/redis"

const workoutsRouter = new Hono()


workoutsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const cacheKey = `user:${user.id}:workouts`

  const cached = await redisClient.get(cacheKey)
  if (cached) {
    return c.json({
      success: true,
      workouts: JSON.parse(cached),
    })
  }

  const userWorkouts = await db.query.workouts.findMany()

  if (userWorkouts.length === 0) {
    return c.json({ message: "No workouts found" }, 404)
  }

  try {
    await redisClient.setEx(cacheKey, 36000, JSON.stringify(userWorkouts))
  } catch (err) {
    console.error("Redis SET error:", err)
  }

  return c.json(userWorkouts)
})

export default workoutsRouter

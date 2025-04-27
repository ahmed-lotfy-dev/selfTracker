import { Hono } from "hono"
import { db } from "../db"
import { workouts } from "../db/schema"
import { getCache, setCache } from "../../lib/redis"

const workoutsRouter = new Hono()

workoutsRouter.get("/", async (c) => {
  const user = c.get("user" as any)

  if (!user) return c.json({ message: "Unauthorized" }, 401)
  const cached = await getCache(`workouts:${user.id}`)

  if (cached) {
    return c.json({ workouts: JSON.parse(cached) })
  }
  const userWorkouts = await db.query.workouts.findMany()

  if (userWorkouts.length === 0) {
    return c.json({ message: "No workouts found" }, 404)
  }

  await setCache(`workouts:${user.id}`, 3600, userWorkouts)
  const response = {
    workouts: userWorkouts,
  }

  return c.json({ workouts: userWorkouts })
})

export default workoutsRouter

import { Hono } from "hono"
import { db } from "../db"
import { workouts } from "../db/schema"

const workoutsRouter = new Hono()

workoutsRouter.get("/", async (c) => {
  const userWorkouts = await db.select().from(workouts)
  return c.json(userWorkouts)
})

export default workoutsRouter

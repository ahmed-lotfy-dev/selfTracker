import { Hono } from "hono"
import { db } from "../db"
import { workout } from "../db/schema"

const workoutsRouter = new Hono()

workoutsRouter.get("/", async (c) => {
  const userWorkouts = await db.select().from(workout)
  return c.json(userWorkouts)
})

export default workoutsRouter

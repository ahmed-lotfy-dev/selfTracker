import { Hono } from "hono"
import { db } from "../db"
import { workouts } from "../db/schema"
import { getCache, setCache } from "../../lib/redis"

const workoutsRouter = new Hono()

workoutsRouter.get("/", async (c) => {
  // Workout templates are public - they're just training split names
  const user = c.get("user" as any);
  const cacheKey = user ? `workouts:${user.id}` : 'workouts:public';

  const cached = await getCache(cacheKey);
  if (cached) {
    return c.json(cached);
  }

  // Return all workout templates (these are global, not user-specific)
  const allWorkouts = await db.query.workouts.findMany();

  await setCache(cacheKey, 3600, allWorkouts);

  return c.json(allWorkouts);
})

export default workoutsRouter

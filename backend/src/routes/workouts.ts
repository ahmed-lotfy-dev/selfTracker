import { Hono } from "hono"
import { db } from "../db"
import { workouts } from "../db/schema"
import { getCache, setCache, clearCache } from "../../lib/redis"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { upsertEmbedding, templateTrainingSplit } from "../services/embeddingHelper"

const workoutsRouter = new Hono()

const createWorkoutSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  trainingSplitId: z.string().optional().nullable(),
  isPublic: z.boolean().optional().nullable(),
  createdAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  updatedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
  deletedAt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
})

workoutsRouter.get("/", async (c) => {
  // Workout templates are public - they're just training split names
  const user = c.get("user" as any);
  const cacheKey = user ? `workouts:${user.id}` : 'workouts:public';

  const cached = await getCache(cacheKey);
  if (cached) {
    return c.json(cached);
  }

  // Return workouts belonging to the user OR public workouts
  // This ensures users see their own workouts and public templates
  const allWorkouts = await db.query.workouts.findMany({
    where: (workouts, { eq, or }) => 
      or(
        eq(workouts.userId, user?.id ?? ''),
        eq(workouts.isPublic, true)
      )
  });

  await setCache(cacheKey, 3600, allWorkouts);

  return c.json(allWorkouts);
})

workoutsRouter.post("/", zValidator("json", createWorkoutSchema), async (c) => {
  const user = c.get("user" as any);
  if (!user) return c.json({ message: "Unauthorized" }, 401);

  const body = c.req.valid("json");

  try {
    const [created] = await db.insert(workouts).values({
      id: body.id || crypto.randomUUID(),
      name: body.name,
      trainingSplitId: body.trainingSplitId ?? null,
      userId: user.id,
      isPublic: body.isPublic ?? false,
      createdAt: body.createdAt || new Date(),
      updatedAt: body.updatedAt || new Date(),
      deletedAt: body.deletedAt,
    }).onConflictDoUpdate({
      target: workouts.id,
      set: {
        name: body.name,
        trainingSplitId: body.trainingSplitId ?? null,
        isPublic: body.isPublic ?? false,
        updatedAt: new Date(),
        deletedAt: body.deletedAt,
      }
    }).returning();

    await clearCache(`workouts:${user.id}`);

    return c.json(created);
  } catch (err) {
    console.error("Error creating workout:", err);
    return c.json({ message: "Failed to create workout" }, 500);
  }
})

export default workoutsRouter

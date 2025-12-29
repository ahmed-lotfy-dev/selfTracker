import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { clearCache, getCache, setCache } from "../../lib/redis.js"
import {
  createFoodLog,
  deleteFoodLog,
  getUserFoodLogs,
  getUserNutritionGoals,
  updateFoodLog,
  upsertNutritionGoals,
} from "../services/nutritionService"
import { analyzeFoodImage } from "../services/geminiVisionService"
import { rateLimitPresets } from "../middlewares/rateLimitMiddleware"

const nutritionRouter = new Hono()

const foodItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
})

const createFoodLogSchema = z.object({
  id: z.string().optional(),
  loggedAt: z.string().or(z.date()).transform((val) => new Date(val)),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foodItems: z.array(foodItemSchema),
  totalCalories: z.number(),
  totalProtein: z.number().optional(),
  totalCarbs: z.number().optional(),
  totalFat: z.number().optional(),
  createdAt: z.string().or(z.date()).optional().transform((val) => (val ? new Date(val) : undefined)),
  updatedAt: z.string().or(z.date()).optional().transform((val) => (val ? new Date(val) : undefined)),
})

const updateFoodLogSchema = z.object({
  loggedAt: z.string().or(z.date()).optional().transform((val) => (val ? new Date(val) : undefined)),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  foodItems: z.array(foodItemSchema).optional(),
  totalCalories: z.number().optional(),
  totalProtein: z.number().optional(),
  totalCarbs: z.number().optional(),
  totalFat: z.number().optional(),
})

const analyzeImageSchema = z.object({
  image: z.string(),
})

const nutritionGoalsSchema = z.object({
  dailyCalories: z.number(),
  proteinGrams: z.number().optional(),
  carbsGrams: z.number().optional(),
  fatGrams: z.number().optional(),
})

nutritionRouter.post(
  "/analyze",
  rateLimitPresets.ai,
  rateLimitPresets.aiDaily,
  zValidator("json", analyzeImageSchema),
  async (c) => {
    const user = c.get("user" as any)
    if (!user) return c.json({ message: "Unauthorized" }, 401)

    const { image } = c.req.valid("json")

    try {
      const result = await analyzeFoodImage(image)
      return c.json(result)
    } catch (error) {
      console.error("Error analyzing food image:", error)
      return c.json({ message: "Failed to analyze image", error: (error as Error).message }, 500)
    }
  })

nutritionRouter.get("/logs", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const dateParam = c.req.query("date")
  const date = dateParam ? new Date(dateParam) : undefined

  try {
    const cacheKey = `foodLogs:${user.id}:${dateParam || "all"}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return c.json({ foodLogs: cached })
    }

    const logs = await getUserFoodLogs(user.id, date)
    await setCache(cacheKey, 1800, logs)

    return c.json({ foodLogs: logs })
  } catch (error) {
    console.error("Error fetching food logs:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

nutritionRouter.post("/logs", zValidator("json", createFoodLogSchema), async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const body = c.req.valid("json")

  try {
    const created = await createFoodLog(user.id, body)
    await clearCache(`foodLogs:${user.id}:all`)

    return c.json({
      message: "Food log created successfully",
      foodLog: created,
    })
  } catch (error) {
    console.error("Error creating food log:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

nutritionRouter.patch("/logs/:id", zValidator("json", updateFoodLogSchema), async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { id } = c.req.param()
  const body = c.req.valid("json")

  if (Object.keys(body).length === 0) {
    return c.json({ message: "At least one field is required" }, 400)
  }

  try {
    const updated = await updateFoodLog(id, user.id, body)

    if (!updated) {
      return c.json({ message: "Food log not found or unauthorized" }, 404)
    }

    await clearCache(`foodLogs:${user.id}:all`)

    return c.json({
      message: "Food log updated successfully",
      foodLog: updated,
    })
  } catch (error) {
    console.error("Error updating food log:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

nutritionRouter.delete("/logs/:id", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const id = c.req.param("id")

  try {
    const deleted = await deleteFoodLog(user.id, id)

    if (!deleted) {
      return c.json({ message: "Food log not found" }, 404)
    }

    await clearCache(`foodLogs:${user.id}:all`)

    return c.json({ message: "Food log deleted successfully" })
  } catch (error) {
    console.error("Error deleting food log:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

nutritionRouter.get("/goals", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const goals = await getUserNutritionGoals(user.id)
    return c.json({ goals: goals || null })
  } catch (error) {
    console.error("Error fetching nutrition goals:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

nutritionRouter.put("/goals", zValidator("json", nutritionGoalsSchema), async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const body = c.req.valid("json")

  try {
    const goals = await upsertNutritionGoals(user.id, body)
    return c.json({
      message: "Nutrition goals updated successfully",
      goals,
    })
  } catch (error) {
    console.error("Error updating nutrition goals:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default nutritionRouter

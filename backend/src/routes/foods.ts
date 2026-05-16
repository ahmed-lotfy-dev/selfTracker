import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import {
  searchFoods,
  getFoodById,
  getFoodByBarcode,
  getFoodCategories,
  getFoodStats,
} from "../services/foodDatabaseService"

const foodRouter = new Hono()

const searchQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  category: z.string().optional(),
  source: z.string().optional(),
  language: z.enum(["en", "ar", "both"]).optional().default("both"),
})

// Search foods (public — no auth needed, used by mobile app for food lookup)
foodRouter.get("/search", zValidator("query", searchQuerySchema), async (c) => {
  const { q, limit, offset, category, source, language } = c.req.valid("query")
  const clientIp = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"

  console.log(`[FoodAPI] GET /api/foods/search — query="${q || ""}", limit=${limit}, offset=${offset}, category=${category || "all"}, source=${source || "all"}, lang=${language}, ip=${clientIp}`)

  try {
    const startTime = Date.now()
    const results = await searchFoods(q || "", {
      limit,
      offset,
      category,
      source: source as any,
      language,
    })
    const elapsed = Date.now() - startTime

    console.log(`[FoodAPI] Search returned ${results.foods.length} results (total: ${results.total}) in ${elapsed}ms`)

    return c.json({
      foods: results.foods,
      total: results.total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error(`[FoodAPI] Search error: ${error.message}`, error.stack)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get food by ID
foodRouter.get("/:id", async (c) => {
  const id = c.req.param("id")
  console.log(`[FoodAPI] GET /api/foods/${id}`)

  try {
    const food = await getFoodById(id)
    if (!food) {
      console.log(`[FoodAPI] Food not found: ${id}`)
      return c.json({ message: "Food not found" }, 404)
    }
    console.log(`[FoodAPI] Returned: "${food.nameEn}" (${food.nameAr || "no arabic"}) | ${food.calories} kcal`)
    return c.json({ food })
  } catch (error: any) {
    console.error(`[FoodAPI] Get by ID error: ${error.message}`, error.stack)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get food by barcode
foodRouter.get("/barcode/:barcode", async (c) => {
  const barcode = c.req.param("barcode")
  console.log(`[FoodAPI] GET /api/foods/barcode/${barcode}`)

  try {
    const food = await getFoodByBarcode(barcode)
    if (!food) {
      console.log(`[FoodAPI] Barcode not found: ${barcode}`)
      return c.json({ message: "Food not found" }, 404)
    }
    console.log(`[FoodAPI] Barcode match: "${food.nameEn}" (${food.brand || "no brand"})`)
    return c.json({ food })
  } catch (error: any) {
    console.error(`[FoodAPI] Barcode lookup error: ${error.message}`, error.stack)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get all categories
foodRouter.get("/meta/categories", async (c) => {
  console.log(`[FoodAPI] GET /api/foods/meta/categories`)

  try {
    const startTime = Date.now()
    const categories = await getFoodCategories()
    const elapsed = Date.now() - startTime
    console.log(`[FoodAPI] Returned ${categories.length} categories in ${elapsed}ms: [${categories.join(", ")}]`)
    return c.json({ categories })
  } catch (error: any) {
    console.error(`[FoodAPI] Categories error: ${error.message}`, error.stack)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get database stats
foodRouter.get("/meta/stats", async (c) => {
  console.log(`[FoodAPI] GET /api/foods/meta/stats`)

  try {
    const startTime = Date.now()
    const stats = await getFoodStats()
    const elapsed = Date.now() - startTime
    console.log(`[FoodAPI] Stats: total=${stats.total}, sources=${JSON.stringify(stats.bySource)}, categories=${Object.keys(stats.byCategory).length} in ${elapsed}ms`)
    return c.json(stats)
  } catch (error: any) {
    console.error(`[FoodAPI] Stats error: ${error.message}`, error.stack)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default foodRouter

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

  try {
    const results = await searchFoods(q || "", {
      limit,
      offset,
      category,
      source,
      language,
    })

    return c.json({
      foods: results.foods,
      total: results.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error searching foods:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get food by ID
foodRouter.get("/:id", async (c) => {
  const id = c.req.param("id")

  try {
    const food = await getFoodById(id)
    if (!food) {
      return c.json({ message: "Food not found" }, 404)
    }
    return c.json({ food })
  } catch (error) {
    console.error("Error fetching food:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get food by barcode
foodRouter.get("/barcode/:barcode", async (c) => {
  const barcode = c.req.param("barcode")

  try {
    const food = await getFoodByBarcode(barcode)
    if (!food) {
      return c.json({ message: "Food not found" }, 404)
    }
    return c.json({ food })
  } catch (error) {
    console.error("Error fetching food by barcode:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get all categories
foodRouter.get("/meta/categories", async (c) => {
  try {
    const categories = await getFoodCategories()
    return c.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

// Get database stats
foodRouter.get("/meta/stats", async (c) => {
  try {
    const stats = await getFoodStats()
    return c.json(stats)
  } catch (error) {
    console.error("Error fetching food stats:", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default foodRouter

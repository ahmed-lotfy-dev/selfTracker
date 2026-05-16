import { and, eq, sql, ilike, or } from "drizzle-orm"
import { db } from "../db"
import { foods } from "../db/schema"
import type { Food } from "../db/schema/foods"

export type FoodSearchResult = {
  id: string
  nameEn: string
  nameAr: string | null
  brand: string | null
  category: string | null
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number | null
  sugar: number | null
  sodium: number | null
  imageUrl: string | null
  source: string
}

function mapFood(row: Food): FoodSearchResult {
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    brand: row.brand,
    category: row.category,
    servingSize: row.servingSize,
    servingUnit: row.servingUnit,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    fiber: row.fiber,
    sugar: row.sugar,
    sodium: row.sodium,
    imageUrl: row.imageUrl,
    source: row.source,
  }
}

export const searchFoods = async (
  query: string,
  options?: {
    limit?: number
    offset?: number
    category?: string
    source?: "openfoodfacts" | "usda" | "sfda" | "manual" | "seed"
    language?: "en" | "ar" | "both"
  }
): Promise<{ foods: FoodSearchResult[]; total: number }> => {
  const { limit = 20, offset = 0, category, source, language = "both" } = options || {}

  console.log(`[FoodDB] Searching foods: query="${query}", limit=${limit}, offset=${offset}, category=${category || "all"}, source=${source || "all"}, language=${language}`)

  const conditions = []

  if (query && query.trim().length > 0) {
    const searchTerm = `%${query.trim()}%`

    if (language === "ar") {
      conditions.push(ilike(foods.nameAr, searchTerm))
    } else if (language === "en") {
      conditions.push(ilike(foods.nameEn, searchTerm))
    } else {
      conditions.push(
        or(
          ilike(foods.nameEn, searchTerm),
          ilike(foods.nameAr, searchTerm),
          ilike(foods.brand, searchTerm)
        )
      )
    }
  }

  if (category) {
    conditions.push(eq(foods.category, category))
  }

  if (source) {
    conditions.push(eq(foods.source, source))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const startTime = Date.now()
  const results = await db.query.foods.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: [foods.nameEn],
  })

  // Use a separate count query (window functions don't work well with parameterized queries on Neon)
  const countQuery = await db.select({ count: sql<number>`count(*)` }).from(foods).where(whereClause)
  const total = countQuery?.[0]?.count ?? results.length

  const elapsed = Date.now() - startTime

  console.log(`[FoodDB] Search complete: ${results.length} results (total: ${total}) in ${elapsed}ms`)

  return {
    foods: results.map(mapFood),
    total,
  }
}

export const getFoodById = async (id: string): Promise<FoodSearchResult | null> => {
  console.log(`[FoodDB] Getting food by ID: ${id}`)
  const food = await db.query.foods.findFirst({
    where: eq(foods.id, id),
  })
  if (food) {
    console.log(`[FoodDB] Found: "${food.nameEn}" (${food.nameAr || "no arabic name"}) | ${food.calories} kcal/${food.servingSize}${food.servingUnit} | source: ${food.source}`)
  } else {
    console.log(`[FoodDB] Food not found for ID: ${id}`)
  }
  return food ? mapFood(food) : null
}

export const getFoodByBarcode = async (barcode: string): Promise<FoodSearchResult | null> => {
  console.log(`[FoodDB] Looking up barcode: ${barcode}`)
  const food = await db.query.foods.findFirst({
    where: eq(foods.barcode, barcode),
  })
  if (food) {
    console.log(`[FoodDB] Barcode match: "${food.nameEn}" (${food.nameAr || "no arabic name"}) | ${food.calories} kcal | brand: ${food.brand || "N/A"}`)
  } else {
    console.log(`[FoodDB] No food found for barcode: ${barcode}`)
  }
  return food ? mapFood(food) : null
}

export const getFoodCategories = async (): Promise<string[]> => {
  console.log(`[FoodDB] Fetching all food categories...`)
  const results = await db
    .selectDistinct({ category: foods.category })
    .from(foods)
    .where(sql`${foods.category} IS NOT NULL`)

  const categories = results.map((r) => r.category).filter(Boolean) as string[]
  console.log(`[FoodDB] Found ${categories.length} categories: ${categories.join(", ")}`)
  return categories
}

export const upsertFood = async (food: {
  nameEn: string
  nameAr?: string | null
  brand?: string | null
  category?: string | null
  servingSize?: number
  servingUnit?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number | null
  sugar?: number | null
  sodium?: number | null
  saturatedFat?: number | null
  cholesterol?: number | null
  potassium?: number | null
  source?: "openfoodfacts" | "usda" | "sfda" | "manual" | "seed"
  sourceId?: string | null
  barcode?: string | null
  imageUrl?: string | null
}): Promise<FoodSearchResult> => {
  console.log(`[FoodDB] Upserting food: "${food.nameEn}" (${food.nameAr || "no arabic"}) | ${food.calories} kcal/${food.servingSize ?? 100}${food.servingUnit ?? "g"} | source: ${food.source ?? "manual"}`)

  let existing: Food | undefined

  if (food.sourceId && food.source) {
    existing = await db.query.foods.findFirst({
      where: and(eq(foods.source, food.source), eq(foods.sourceId, food.sourceId)),
    })
    if (existing) {
      console.log(`[FoodDB] Found existing by source+id: ${existing.id} — updating`)
    }
  }

  if (!existing && food.barcode) {
    existing = await db.query.foods.findFirst({
      where: eq(foods.barcode, food.barcode),
    })
    if (existing) {
      console.log(`[FoodDB] Found existing by barcode: ${existing.id} — updating`)
    }
  }

  if (!existing) {
    existing = await db.query.foods.findFirst({
      where: and(
        ilike(foods.nameEn, food.nameEn),
        food.brand ? ilike(foods.brand, food.brand) : sql`1=1`
      ),
    })
    if (existing) {
      console.log(`[FoodDB] Found existing by name+brand: ${existing.id} — updating`)
    }
  }

  if (existing) {
    const [updated] = await db
      .update(foods)
      .set({
        ...food,
        updatedAt: new Date(),
      })
      .where(eq(foods.id, existing.id))
      .returning()
    console.log(`[FoodDB] Updated food: "${updated.nameEn}" (id: ${updated.id})`)
    return mapFood(updated)
  }

  const [created] = await db
    .insert(foods)
    .values({
      nameEn: food.nameEn,
      nameAr: food.nameAr ?? null,
      brand: food.brand ?? null,
      category: food.category ?? null,
      servingSize: food.servingSize ?? 100,
      servingUnit: food.servingUnit ?? "g",
      calories: food.calories ?? 0,
      protein: food.protein ?? 0,
      carbs: food.carbs ?? 0,
      fat: food.fat ?? 0,
      fiber: food.fiber ?? null,
      sugar: food.sugar ?? null,
      sodium: food.sodium ?? null,
      saturatedFat: food.saturatedFat ?? null,
      cholesterol: food.cholesterol ?? null,
      potassium: food.potassium ?? null,
      source: food.source ?? "manual",
      sourceId: food.sourceId ?? null,
      barcode: food.barcode ?? null,
      imageUrl: food.imageUrl ?? null,
    })
    .returning()

  console.log(`[FoodDB] Created food: "${created.nameEn}" (id: ${created.id})`)
  return mapFood(created)
}

export const bulkUpsertFoods = async (
  foodList: Array<Parameters<typeof upsertFood>[0]>
): Promise<number> => {
  console.log(`[FoodDB] Bulk upserting ${foodList.length} foods...`)
  let count = 0
  let errors = 0
  for (const food of foodList) {
    try {
      await upsertFood(food)
      count++
    } catch (err) {
      errors++
      console.error(`[FoodDB] Failed to upsert food "${food.nameEn}":`, err)
    }
  }
  console.log(`[FoodDB] Bulk upsert complete: ${count} succeeded, ${errors} failed out of ${foodList.length}`)
  return count
}

export const getFoodStats = async (): Promise<{
  total: number
  bySource: Record<string, number>
  byCategory: Record<string, number>
}> => {
  console.log(`[FoodDB] Calculating food database statistics...`)
  const startTime = Date.now()

  const allFoods = await db.select().from(foods)

  const bySource: Record<string, number> = {}
  const byCategory: Record<string, number> = {}

  for (const food of allFoods) {
    bySource[food.source] = (bySource[food.source] || 0) + 1
    if (food.category) {
      byCategory[food.category] = (byCategory[food.category] || 0) + 1
    }
  }

  const elapsed = Date.now() - startTime
  console.log(`[FoodDB] Stats calculated in ${elapsed}ms — Total: ${allFoods.length} foods`)
  console.log(`[FoodDB] By source: ${JSON.stringify(bySource)}`)
  console.log(`[FoodDB] By category: ${JSON.stringify(byCategory)}`)

  return {
    total: allFoods.length,
    bySource,
    byCategory,
  }
}

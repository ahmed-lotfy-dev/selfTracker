/**
 * USDA FoodData Central Import Script
 * 
 * Downloads USDA food data CSV dumps and imports into Neon PostgreSQL.
 * USDA provides free data dumps at: https://fdc.nal.usda.gov/download-datasets.html
 * 
 * Files needed (download manually or via script):
 *   - food.csv
 *   - food_nutrient.csv
 *   - nutrient.csv
 *   - food_portion.csv
 * 
 * Usage (on VPS):
 *   cd /path/to/backend
 *   bun run scripts/food-imports/import-usda.ts [--dir /tmp/food-imports/usda]
 * 
 * Or download first:
 *   wget -P /tmp/food-imports/usda https://fdc.nal.usda.gov/fdc_app.html#/V2/food-details/...
 *   (USDA requires manual download from their website)
 */

import { createReadStream, existsSync, mkdirSync, writeFileSync } from "fs"
import { parse } from "csv-parse"
import { db } from "../../src/db"
import { foods } from "../../src/db/schema"
import { eq, and } from "drizzle-orm"

const DATA_DIR = "/tmp/food-imports/usda"
const BATCH_SIZE = 500

// USDA nutrient IDs
const NUTRIENT_IDS = {
  calories: 1008,    // Energy (kcal)
  protein: 1003,     // Protein
  carbs: 1005,       // Carbohydrate
  fat: 1004,         // Total lipid (fat)
  fiber: 1079,       // Fiber, total dietary
  sugar: 2000,       // Sugars, total
  sodium: 1093,      // Sodium
  saturatedFat: 1258, // Fatty acids, total saturated
  cholesterol: 1253, // Cholesterol
  potassium: 1092,   // Potassium
}

interface USDAFood {
  fdc_id: string
  data_type: string
  description: string
  food_category_id: string
  publication_date: string
}

interface USDAFoodNutrient {
  id: string
  fdc_id: string
  nutrient_id: string
  amount: string
  data_points: string
  derivation_code: string
}

interface USDANutrient {
  id: string
  name: string
  unit_name: string
  nutrient_nbr: string
}

interface USDAFoodPortion {
  id: string
  fdc_id: string
  seq_num: string
  amount: string
  measure_unit_id: string
  portion_description: string
  modifier: string
  gram_weight: string
  data_points: string
}

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function readCSV<T>(filePath: string): Promise<T[]> {
  if (!existsSync(filePath)) {
    console.warn(`[USDA] File not found: ${filePath}`)
    return []
  }

  const records: T[] = []
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
  })

  return new Promise((resolve, reject) => {
    parser.on("readable", () => {
      let record
      while ((record = parser.read()) !== null) {
        records.push(record as T)
      }
    })
    parser.on("error", reject)
    parser.on("end", () => resolve(records))
    createReadStream(filePath).pipe(parser)
  })
}

async function main() {
  const dataDir = parseArg("--dir", DATA_DIR)
  const limit = parseInt(parseArg("--limit", "0"))

  console.log("=== USDA FoodData Central Import ===")
  console.log(`Data directory: ${dataDir}`)

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
    console.log(`\n[USDA] Directory created: ${dataDir}`)
    console.log("[USDA] Please download the following files from https://fdc.nal.usda.gov/download-datasets.html:")
    console.log("  - food.csv")
    console.log("  - food_nutrient.csv")
    console.log("  - nutrient.csv (optional)")
    console.log("  - food_portion.csv (optional)")
    console.log("\nThen re-run this script.")
    return
  }

  // Read food data
  console.log("[USDA] Reading food.csv...")
  const foodRecords = await readCSV<USDAFood>(`${dataDir}/food.csv`)
  console.log(`[USDA] Found ${foodRecords.length} food records`)

  // Read nutrient data
  console.log("[USDA] Reading food_nutrient.csv...")
  const nutrientRecords = await readCSV<USDAFoodNutrient>(`${dataDir}/food_nutrient.csv`)
  console.log(`[USDA] Found ${nutrientRecords.length} nutrient records`)

  // Read portion data (optional)
  console.log("[USDA] Reading food_portion.csv...")
  const portionRecords = await readCSV<USDAFoodPortion>(`${dataDir}/food_portion.csv`)
  console.log(`[USDA] Found ${portionRecords.length} portion records`)

  // Build lookup maps
  const nutrientMap = new Map<string, Map<string, number>>() // fdc_id -> nutrient_id -> amount
  for (const n of nutrientRecords) {
    if (!nutrientMap.has(n.fdc_id)) {
      nutrientMap.set(n.fdc_id, new Map())
    }
    nutrientMap.get(n.fdc_id)!.set(n.nutrient_id, parseFloat(n.amount) || 0)
  }

  const portionMap = new Map<string, USDAFoodPortion[]>()
  for (const p of portionRecords) {
    if (!portionMap.has(p.fdc_id)) {
      portionMap.set(p.fdc_id, [])
    }
    portionMap.get(p.fdc_id)!.push(p)
  }

  // Filter to foundation_food and survey_food types for quality
  const qualityFoods = foodRecords.filter(
    (f) => f.data_type === "foundation_food" || f.data_type === "survey_fdsnd" || f.data_type === "sr_legacy_food"
  )
  console.log(`[USDA] Quality foods (foundation/survey): ${qualityFoods.length}`)

  // Import
  let totalProcessed = 0
  let totalImported = 0
  let batch: ReturnType<typeof mapUSDAFood>[] = []

  for (const food of qualityFoods) {
    if (limit > 0 && totalImported >= limit) break

    totalProcessed++
    const mapped = mapUSDAFood(food, nutrientMap, portionMap)
    if (mapped) {
      batch.push(mapped)
    }

    if (batch.length >= BATCH_SIZE) {
      const count = await importBatch(batch)
      totalImported += count
      console.log(`[USDA] Progress: ${totalProcessed} processed, ${totalImported} imported`)
      batch = []
    }
  }

  // Final batch
  if (batch.length > 0) {
    const count = await importBatch(batch)
    totalImported += count
  }

  console.log("\n=== Import Complete ===")
  console.log(`Total processed: ${totalProcessed}`)
  console.log(`Total imported: ${totalImported}`)

  const finalCount = await db.select().from(foods).where(eq(foods.source, "usda"))
  console.log(`Total USDA foods in DB: ${finalCount.length}`)
}

function mapUSDAFood(
  food: USDAFood,
  nutrientMap: Map<string, Map<string, number>>,
  portionMap: Map<string, USDAFoodPortion[]>
) {
  const description = food.description?.trim()
  if (!description || description.length < 2) return null

  const nutrients = nutrientMap.get(food.fdc_id)
  if (!nutrients) return null

  const calories = nutrients.get(String(NUTRIENT_IDS.calories))
  if (!calories || calories <= 0) return null

  // Get default portion (first one, or 100g)
  const portions = portionMap.get(food.fdc_id)
  const defaultPortion = portions?.[0]
  const servingSize = defaultPortion ? parseFloat(defaultPortion.gram_weight) || 100 : 100

  return {
    nameEn: description.slice(0, 500),
    nameAr: null,
    brand: null,
    category: food.data_type || null,
    servingSize,
    servingUnit: "g" as const,
    calories,
    protein: nutrients.get(String(NUTRIENT_IDS.protein)) || 0,
    carbs: nutrients.get(String(NUTRIENT_IDS.carbs)) || 0,
    fat: nutrients.get(String(NUTRIENT_IDS.fat)) || 0,
    fiber: nutrients.get(String(NUTRIENT_IDS.fiber)) || null,
    sugar: nutrients.get(String(NUTRIENT_IDS.sugar)) || null,
    sodium: nutrients.get(String(NUTRIENT_IDS.sodium)) || null,
    saturatedFat: nutrients.get(String(NUTRIENT_IDS.saturatedFat)) || null,
    cholesterol: nutrients.get(String(NUTRIENT_IDS.cholesterol)) || null,
    potassium: nutrients.get(String(NUTRIENT_IDS.potassium)) || null,
    source: "usda" as const,
    sourceId: food.fdc_id,
    barcode: null,
    imageUrl: null,
  }
}

async function importBatch(batch: ReturnType<typeof mapUSDAFood>[]): Promise<number> {
  let inserted = 0
  for (const item of batch) {
    if (!item) continue
    try {
      const existing = await db.query.foods.findFirst({
        where: and(eq(foods.source, "usda"), eq(foods.sourceId, item.sourceId)),
      })

      if (existing) {
        await db.update(foods).set({ ...item, updatedAt: new Date() }).where(eq(foods.id, existing.id))
      } else {
        await db.insert(foods).values(item)
      }
      inserted++
    } catch (err: any) {
      if (!err.message?.includes("duplicate")) {
        console.error(`[USDA] Error importing "${item.nameEn}": ${err.message}`)
      }
    }
  }
  return inserted
}

main().catch(console.error)

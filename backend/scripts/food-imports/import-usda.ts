/**
 * USDA FoodData Central Import Script
 * Imports Foundation Foods + SR Legacy foods
 *
 * Usage (on VPS):
 *   docker exec selftracker-backend bun run scripts/food-imports/import-usda.ts
 *   docker exec selftracker-backend bun run scripts/food-imports/import-usda.ts --limit 1000
 */

import { db } from "../../src/db"
import { foods } from "../../src/db/schema"
import { sql } from "drizzle-orm"
import { createReadStream, existsSync } from "fs"
import { parse } from "csv-parse"
import { pipeline } from "stream/promises"
import { Transform } from "stream"

const DATA_DIR = "/tmp/food-imports"
const BATCH_SIZE = 500

// USDA nutrient ID mapping to our column names
// Foundation uses nutrient_id, SR Legacy uses nutrient_id (same IDs)
const NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein",
  "1004": "fat",
  "1005": "carbs",
  "1008": "calories",
  "1079": "fiber",
  "1089": "iron",
  "1090": "magnesium",
  "1091": "phosphorus",
  "1092": "potassium",
  "1093": "sodium",
  "1095": "zinc",
  "1098": "copper",
  "1101": "manganese",
  "1106": "vitamin_a_100g",
  "1109": "vitamin_e_100g",
  "1112": "vitamin_d_100g",
  "1114": "vitamin_c_100g",
  "1120": "vitamin_b1_100g",
  "1122": "vitamin_b2_100g",
  "1124": "pantothenic_acid_100g",
  "1125": "vitamin_b6_100g",
  "1126": "vitamin_b9_100g",
  "1128": "vitamin_b12_100g",
  "1162": "cholesterol",
  "1253": "cholesterol",
  "1257": "trans_fat_100g",
  "1258": "saturated_fat_100g",
  "1292": "fiber",
  "2000": "sugar",
}

interface FoodRow {
  fdc_id: string
  description: string
  food_category_id?: string
  publication_date?: string
}

interface NutrientRow {
  fdc_id: string
  nutrient_id: string
  amount: string
}

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function importUSDA(source: string, foodFile: string, nutrientFile: string, limit: number) {
  console.log(`[USDA] Importing ${source} from ${foodFile}`)

  if (!existsSync(foodFile) || !existsSync(nutrientFile)) {
    console.error(`[USDA] Files not found. Run download script first.`)
    return
  }

  // Step 1: Load all foods
  console.log(`[USDA] Loading foods...`)
  const foodRecords: FoodRow[] = []
  const parser = parse({ columns: true, skip_empty_lines: true })

  await new Promise<void>((resolve, reject) => {
    parser.on("readable", () => {
      let record
      while ((record = parser.read()) !== null) {
        foodRecords.push({
          fdc_id: record.fdc_id,
          description: record.description,
          food_category_id: record.food_category_id,
          publication_date: record.publication_date,
        })
      }
    })
    parser.on("error", reject)
    parser.on("end", () => resolve())
    createReadStream(foodFile).pipe(parser)
  })

  console.log(`[USDA] Loaded ${foodRecords.length} foods`)

  // Step 2: Load nutrients into memory (fdc_id -> nutrient map)
  console.log(`[USDA] Loading nutrients...`)
  const nutrientMap = new Map<string, Record<string, number>>()

  const nutrientParser = parse({ columns: true, skip_empty_lines: true })
  await new Promise<void>((resolve, reject) => {
    nutrientParser.on("readable", () => {
      let record
      while ((record = nutrientParser.read()) !== null) {
        const fdcId = record.fdc_id
        const nutrientId = record.nutrient_id
        const amount = parseFloat(record.amount)
        const colName = NUTRIENT_MAP[nutrientId]

        if (colName && !isNaN(amount)) {
          if (!nutrientMap.has(fdcId)) {
            nutrientMap.set(fdcId, {})
          }
          nutrientMap.get(fdcId)![colName] = amount
        }
      }
    })
    nutrientParser.on("error", reject)
    nutrientParser.on("end", () => resolve())
    createReadStream(nutrientFile).pipe(nutrientParser)
  })

  console.log(`[USDA] Loaded nutrients for ${nutrientMap.size} foods`)

  // Step 3: Import in batches
  console.log(`[USDA] Importing to database...`)
  let imported = 0
  let errors = 0
  const batchSize = BATCH_SIZE
  const maxRecords = limit > 0 ? limit : foodRecords.length

  for (let i = 0; i < Math.min(foodRecords.length, maxRecords); i += batchSize) {
    const batch = foodRecords.slice(i, i + batchSize)
    const values = batch.map(food => {
      const n = nutrientMap.get(food.fdc_id) || {}
      return {
        nameEn: food.description?.slice(0, 500) || "Unknown",
        nameAr: null,
        brand: null,
        brandOwner: null,
        category: food.food_category_id || null,
        source: source,
        sourceId: food.fdc_id,
        barcode: null,
        servingSize: 100,
        servingUnit: "g",
        calories: n.calories || 0,
        protein: n.protein || 0,
        carbs: n.carbs || 0,
        fat: n.fat || 0,
        fiber: n.fiber || 0,
        sugar: n.sugar || 0,
        sodium: n.sodium || 0,
        saturatedFat: n.saturated_fat || 0,
        cholesterol: n.cholesterol || 0,
        potassium: n.potassium || 0,
        calcium: n.calcium || null,
        phosphorus: n.phosphorus || null,
        iron: n.iron || null,
        magnesium: n.magnesium || null,
        zinc: n.zinc || null,
        copper: n.copper || null,
        manganese: n.manganese || null,
        selenium: n.selenium || null,
        iodine: n.iodine || null,
        vitaminA: n.vitamin_a_100g || null,
        vitaminD: n.vitamin_d_100g || null,
        vitaminE: n.vitamin_e_100g || null,
        vitaminK: n.vitamin_k_100g || null,
        vitaminC: n.vitamin_c_100g || null,
        vitaminB1: n.vitamin_b1_100g || null,
        vitaminB2: n.vitamin_b2_100g || null,
        vitaminB6: n.vitamin_b6_100g || null,
        vitaminB9: n.vitamin_b9_100g || null,
        vitaminB12: n.vitamin_b12_100g || null,
        pantothenicAcid: n.pantothenic_acid_100g || null,
        biotin: n.biotin_100g || null,
        choline: n.choline_100g || null,
        transFat: n.trans_fat_100g || null,
        addedSugars: n.added_sugars_100g || null,
        starch: n.starch_100g || null,
        polyols: n.polyols_100g || null,
        solubleFiber: n.soluble_fiber_100g || null,
        insolubleFiber: n.insoluble_fiber_100g || null,
        salt: n.salt_100g || null,
        alcohol: n.alcohol_100g || null,
        caffeine: n.caffeine_100g || null,
        chloride: n.chloride_100g || null,
        publicationDate: food.publication_date || null,
      }
    })

    try {
      await db.insert(foods).values(values).onConflictDoNothing({
        target: [foods.source, foods.sourceId],
      })
      imported += batch.length
    } catch (err: any) {
      errors += batch.length
      console.error(`[USDA] Batch error: ${err.message?.slice(0, 100)}`)
    }

    if (imported % 5000 === 0) {
      console.log(`[USDA] Progress: ${imported} imported, ${errors} errors`)
    }
  }

  console.log(`\n[USDA] ${source} Import Complete!`)
  console.log(`Imported: ${imported}`)
  console.log(`Errors: ${errors}`)
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0"))

  console.log("========================================")
  console.log("  USDA FoodData Central Import")
  console.log("========================================")

  // Import Foundation Foods
  await importUSDA(
    "usda_foundation",
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv`,
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv`,
    limit
  )

  // Import SR Legacy
  await importUSDA(
    "usda_sr_legacy",
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food.csv`,
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv`,
    limit
  )

  // Final stats
  const stats = await db.select({ count: sql<number>`count(*)` }).from(foods)
  console.log(`\nTotal foods in DB: ${stats[0].count}`)
}

main().catch(console.error)

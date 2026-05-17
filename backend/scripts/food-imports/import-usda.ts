/**
 * USDA FoodData Central Import Script - Bulk Insert
 * Imports Foundation Foods + SR Legacy foods
 *
 * Usage:
 *   docker exec selftracker-backend bun run scripts/food-imports/import-usda.ts --limit 1000
 *   docker exec selftracker-backend bun run scripts/food-imports/import-usda.ts
 */

import { db } from "../../src/db"
import { sql } from "drizzle-orm"
import { createReadStream, existsSync } from "fs"
import { parse } from "csv-parse"

const DATA_DIR = "/tmp/food-imports"
const BATCH_SIZE = 2000

const NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein",
  "1004": "fat",
  "1005": "carbs",
  "1008": "calories",
  "1079": "fiber",
  "1089": "iron_100g",
  "1090": "magnesium_100g",
  "1091": "phosphorus_100g",
  "1092": "potassium",
  "1093": "sodium",
  "1095": "zinc_100g",
  "1098": "copper_100g",
  "1101": "manganese_100g",
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
  "1258": "saturated_fat",
  "1292": "fiber",
  "2000": "sugar",
}

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function loadCSV(filePath: string): Promise<any[]> {
  if (!existsSync(filePath)) { console.error(`Not found: ${filePath}`); return [] }
  const records: any[] = []
  const parser = parse({ columns: true, skip_empty_lines: true })
  return new Promise((resolve, reject) => {
    parser.on("readable", () => { let r; while ((r = parser.read()) !== null) records.push(r) })
    parser.on("error", reject)
    parser.on("end", () => resolve(records))
    createReadStream(filePath).pipe(parser)
  })
}

async function importSource(source: string, foodFile: string, nutrientFile: string, limit: number) {
  console.log(`\n[${source}] Starting import...`)

  const foodRecords = await loadCSV(foodFile)
  console.log(`[${source}] Loaded ${foodRecords.length} foods`)

  const nutrientRecords = await loadCSV(nutrientFile)
  console.log(`[${source}] Loaded ${nutrientRecords.length} nutrient rows`)

  const nutrientMap = new Map<string, Record<string, number>>()
  for (const n of nutrientRecords) {
    const colName = NUTRIENT_MAP[n.nutrient_id]
    const amount = parseFloat(n.amount)
    if (colName && !isNaN(amount)) {
      if (!nutrientMap.has(n.fdc_id)) nutrientMap.set(n.fdc_id, {})
      nutrientMap.get(n.fdc_id)![colName] = amount
    }
  }
  console.log(`[${source}] Nutrients mapped for ${nutrientMap.size} foods`)

  let imported = 0
  let errors = 0
  const max = limit > 0 ? Math.min(limit, foodRecords.length) : foodRecords.length

  for (let i = 0; i < max; i += BATCH_SIZE) {
    const batch = foodRecords.slice(i, i + BATCH_SIZE)

    const names: string[] = []
    const categories: (string|null)[] = []
    const sourceIds: string[] = []
    const caloriesArr: number[] = []
    const proteinArr: number[] = []
    const carbsArr: number[] = []
    const fatArr: number[] = []
    const fiberArr: number[] = []
    const sugarArr: number[] = []
    const sodiumArr: number[] = []
    const satFatArr: number[] = []
    const cholArr: number[] = []
    const potArr: number[] = []
    const calciumArr: (number|null)[] = []
    const ironArr: (number|null)[] = []
    const magnesiumArr: (number|null)[] = []
    const phosphorusArr: (number|null)[] = []
    const zincArr: (number|null)[] = []
    const copperArr: (number|null)[] = []
    const manganeseArr: (number|null)[] = []
    const seleniumArr: (number|null)[] = []
    const vitaArr: (number|null)[] = []
    const vitdArr: (number|null)[] = []
    const viteArr: (number|null)[] = []
    const vitcArr: (number|null)[] = []
    const vitb1Arr: (number|null)[] = []
    const vitb2Arr: (number|null)[] = []
    const vitb6Arr: (number|null)[] = []
    const vitb9Arr: (number|null)[] = []
    const vitb12Arr: (number|null)[] = []
    const transFatArr: (number|null)[] = []
    const addedSugarArr: (number|null)[] = []
    const starchArr: (number|null)[] = []
    const pubDates: (string|null)[] = []

    for (const food of batch) {
      const n = nutrientMap.get(food.fdc_id) || {}
      names.push((food.description || "Unknown").slice(0, 500))
      categories.push(food.food_category_id || null)
      sourceIds.push(food.fdc_id)
      caloriesArr.push(n.calories || 0)
      proteinArr.push(n.protein || 0)
      carbsArr.push(n.carbs || 0)
      fatArr.push(n.fat || 0)
      fiberArr.push(n.fiber || 0)
      sugarArr.push(n.sugar || 0)
      sodiumArr.push(n.sodium || 0)
      satFatArr.push(n.saturated_fat || 0)
      cholArr.push(n.cholesterol || 0)
      potArr.push(n.potassium || 0)
      calciumArr.push(n.calcium_100g || null)
      ironArr.push(n.iron_100g || null)
      magnesiumArr.push(n.magnesium_100g || null)
      phosphorusArr.push(n.phosphorus_100g || null)
      zincArr.push(n.zinc_100g || null)
      copperArr.push(n.copper_100g || null)
      manganeseArr.push(n.manganese_100g || null)
      seleniumArr.push(n.selenium_100g || null)
      vitaArr.push(n.vitamin_a_100g || null)
      vitdArr.push(n.vitamin_d_100g || null)
      viteArr.push(n.vitamin_e_100g || null)
      vitcArr.push(n.vitamin_c_100g || null)
      vitb1Arr.push(n.vitamin_b1_100g || null)
      vitb2Arr.push(n.vitamin_b2_100g || null)
      vitb6Arr.push(n.vitamin_b6_100g || null)
      vitb9Arr.push(n.vitamin_b9_100g || null)
      vitb12Arr.push(n.vitamin_b12_100g || null)
      transFatArr.push(n.trans_fat_100g || null)
      addedSugarArr.push(n.added_sugars_100g || null)
      starchArr.push(n.starch_100g || null)
      pubDates.push(food.publication_date || null)
    }

    try {
      await db.execute(sql`
        INSERT INTO foods (
          name_en, category, source, source_id,
          serving_size, serving_unit,
          calories, protein, carbs, fat, fiber, sugar, sodium,
          saturated_fat, cholesterol, potassium,
          calcium_100g, iron_100g, magnesium_100g, phosphorus_100g,
          zinc_100g, copper_100g, manganese_100g, selenium_100g,
          vitamin_a_100g, vitamin_d_100g, vitamin_e_100g, vitamin_c_100g,
          vitamin_b1_100g, vitamin_b2_100g, vitamin_b6_100g,
          vitamin_b9_100g, vitamin_b12_100g,
          trans_fat_100g, added_sugars_100g, starch_100g,
          publication_date
        )
        SELECT * FROM UNNEST(
          ${names}::text[],
          ${categories}::text[],
          ${Array(batch.length).fill(source)}::text[],
          ${sourceIds}::text[],
          ${Array(batch.length).fill(100)}::real[],
          ${Array(batch.length).fill("g")}::text[],
          ${caloriesArr}::real[],
          ${proteinArr}::real[],
          ${carbsArr}::real[],
          ${fatArr}::real[],
          ${fiberArr}::real[],
          ${sugarArr}::real[],
          ${sodiumArr}::real[],
          ${satFatArr}::real[],
          ${cholArr}::real[],
          ${potArr}::real[],
          ${calciumArr}::real[],
          ${ironArr}::real[],
          ${magnesiumArr}::real[],
          ${phosphorusArr}::real[],
          ${zincArr}::real[],
          ${copperArr}::real[],
          ${manganeseArr}::real[],
          ${seleniumArr}::real[],
          ${vitaArr}::real[],
          ${vitdArr}::real[],
          ${viteArr}::real[],
          ${vitcArr}::real[],
          ${vitb1Arr}::real[],
          ${vitb2Arr}::real[],
          ${vitb6Arr}::real[],
          ${vitb9Arr}::real[],
          ${vitb12Arr}::real[],
          ${transFatArr}::real[],
          ${addedSugarArr}::real[],
          ${starchArr}::real[],
          ${pubDates}::date[]
        ) AS t(
          name_en, category, source, source_id,
          serving_size, serving_unit,
          calories, protein, carbs, fat, fiber, sugar, sodium,
          saturated_fat, cholesterol, potassium,
          calcium_100g, iron_100g, magnesium_100g, phosphorus_100g,
          zinc_100g, copper_100g, manganese_100g, selenium_100g,
          vitamin_a_100g, vitamin_d_100g, vitamin_e_100g, vitamin_c_100g,
          vitamin_b1_100g, vitamin_b2_100g, vitamin_b6_100g,
          vitamin_b9_100g, vitamin_b12_100g,
          trans_fat_100g, added_sugars_100g, starch_100g,
          publication_date
        )
        ON CONFLICT (source, source_id) DO NOTHING
      `)
      imported += batch.length
    } catch (err: any) {
      errors += batch.length
      if (errors <= 3) console.error(`[${source}] Batch error: ${err.message?.slice(0, 150)}`)
    }

    if (imported % 10000 === 0) console.log(`[${source}] Progress: ${imported} imported`)
  }

  console.log(`[${source}] Complete! Imported: ${imported}, Errors: ${errors}`)
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0"))

  console.log("========================================")
  console.log("  USDA FoodData Central Import (Bulk)")
  console.log("========================================")

  await importSource(
    "usda_foundation",
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv`,
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv`,
    limit
  )

  await importSource(
    "usda_sr_legacy",
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food.csv`,
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv`,
    limit
  )

  const stats = await db.execute(sql`SELECT count(*) as total FROM foods`)
  console.log(`\nTotal foods in DB: ${stats[0].total}`)
}

main().catch(console.error)

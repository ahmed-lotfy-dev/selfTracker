/**
 * Master Food Database Import Script
 * 1. Truncates all existing data
 * 2. Imports USDA Foundation Foods
 * 3. Imports USDA SR Legacy Foods
 * 4. Imports USDA Branded Foods
 *
 * Usage:
 *   docker exec selftracker-backend bun run scripts/food-imports/import-all.ts
 *   docker exec selftracker-backend bun run scripts/food-imports/import-all.ts --limit 100
 */

import { db } from "../../src/db"
import { sql } from "drizzle-orm"
import { createReadStream, existsSync } from "fs"
import { parse } from "csv-parse"

const DATA_DIR = "/tmp/food-imports"
const BATCH_SIZE = 2000

const USDA_NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein", "1004": "fat", "1005": "carbs", "1008": "calories",
  "1079": "fiber", "1089": "iron_100g", "1090": "magnesium_100g",
  "1091": "phosphorus_100g", "1092": "potassium", "1093": "sodium",
  "1095": "zinc_100g", "1098": "copper_100g", "1101": "manganese_100g",
  "1106": "vitamin_a_100g", "1109": "vitamin_e_100g", "1112": "vitamin_d_100g",
  "1114": "vitamin_c_100g", "1120": "vitamin_b1_100g", "1122": "vitamin_b2_100g",
  "1124": "pantothenic_acid_100g", "1125": "vitamin_b6_100g",
  "1126": "vitamin_b9_100g", "1128": "vitamin_b12_100g",
  "1162": "cholesterol", "1253": "cholesterol",
  "1257": "trans_fat_100g", "1258": "saturated_fat", "1292": "fiber", "2000": "sugar",
}

const BRANDED_NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein", "1004": "fat", "1005": "carbs", "1008": "calories",
  "1079": "fiber", "1093": "sodium", "1092": "potassium",
  "1258": "saturated_fat", "1162": "cholesterol", "2000": "sugar",
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

async function importUSDA(source: string, foodFile: string, nutrientFile: string, limit: number) {
  console.log(`\n[${source}] Starting...`)
  const foods = await loadCSV(foodFile)
  const nutrients = await loadCSV(nutrientFile)
  console.log(`[${source}] ${foods.length} foods, ${nutrients.length} nutrients`)

  const nMap = new Map<string, Record<string, number>>()
  for (const n of nutrients) {
    const col = USDA_NUTRIENT_MAP[n.nutrient_id]
    const amt = parseFloat(n.amount)
    if (col && !isNaN(amt)) {
      if (!nMap.has(n.fdc_id)) nMap.set(n.fdc_id, {})
      nMap.get(n.fdc_id)![col] = amt
    }
  }

  let imported = 0, errors = 0
  const max = limit > 0 ? Math.min(limit, foods.length) : foods.length

  for (let i = 0; i < max; i += BATCH_SIZE) {
    const batch = foods.slice(i, i + BATCH_SIZE)
    const cols: Record<string, any[]> = {
      names: [], cats: [], sids: [], cal: [], pro: [], carb: [], fat: [],
      fib: [], sug: [], sod: [], sat: [], chol: [], pot: [],
      ca: [], fe: [], mg: [], p: [], zn: [], cu: [], mn: [], se: [],
      va: [], vd: [], ve: [], vc: [], vb1: [], vb2: [], vb6: [], vb9: [], vb12: [],
      tf: [], as: [], st: [], pd: [],
    }
    for (const f of batch) {
      const n = nMap.get(f.fdc_id) || {}
      cols.names.push((f.description || "Unknown").slice(0, 500))
      cols.cats.push(f.food_category_id || null)
      cols.sids.push(f.fdc_id)
      cols.cal.push(n.calories || 0); cols.pro.push(n.protein || 0)
      cols.carb.push(n.carbs || 0); cols.fat.push(n.fat || 0)
      cols.fib.push(n.fiber || 0); cols.sug.push(n.sugar || 0)
      cols.sod.push(n.sodium || 0); cols.sat.push(n.saturated_fat || 0)
      cols.chol.push(n.cholesterol || 0); cols.pot.push(n.potassium || 0)
      cols.ca.push(n.calcium_100g || null); cols.fe.push(n.iron_100g || null)
      cols.mg.push(n.magnesium_100g || null); cols.p.push(n.phosphorus_100g || null)
      cols.zn.push(n.zinc_100g || null); cols.cu.push(n.copper_100g || null)
      cols.mn.push(n.manganese_100g || null); cols.se.push(n.selenium_100g || null)
      cols.va.push(n.vitamin_a_100g || null); cols.vd.push(n.vitamin_d_100g || null)
      cols.ve.push(n.vitamin_e_100g || null); cols.vc.push(n.vitamin_c_100g || null)
      cols.vb1.push(n.vitamin_b1_100g || null); cols.vb2.push(n.vitamin_b2_100g || null)
      cols.vb6.push(n.vitamin_b6_100g || null); cols.vb9.push(n.vitamin_b9_100g || null)
      cols.vb12.push(n.vitamin_b12_100g || null)
      cols.tf.push(n.trans_fat_100g || null); cols.as.push(n.added_sugars_100g || null)
      cols.st.push(n.starch_100g || null); cols.pd.push(f.publication_date || null)
    }
    try {
      await db.execute(sql`
        INSERT INTO foods (name_en, category, source, source_id, serving_size, serving_unit,
          calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium,
          calcium_100g, iron_100g, magnesium_100g, phosphorus_100g, zinc_100g, copper_100g,
          manganese_100g, selenium_100g, vitamin_a_100g, vitamin_d_100g, vitamin_e_100g,
          vitamin_c_100g, vitamin_b1_100g, vitamin_b2_100g, vitamin_b6_100g, vitamin_b9_100g,
          vitamin_b12_100g, trans_fat_100g, added_sugars_100g, starch_100g, publication_date)
        SELECT * FROM UNNEST(
          ${cols.names}::text[], ${cols.cats}::text[], ${Array(batch.length).fill(source)}::text[], ${cols.sids}::text[],
          ${Array(batch.length).fill(100)}::real[], ${Array(batch.length).fill("g")}::text[],
          ${cols.cal}::real[], ${cols.pro}::real[], ${cols.carb}::real[], ${cols.fat}::real[],
          ${cols.fib}::real[], ${cols.sug}::real[], ${cols.sod}::real[], ${cols.sat}::real[],
          ${cols.chol}::real[], ${cols.pot}::real[], ${cols.ca}::real[], ${cols.fe}::real[],
          ${cols.mg}::real[], ${cols.p}::real[], ${cols.zn}::real[], ${cols.cu}::real[],
          ${cols.mn}::real[], ${cols.se}::real[], ${cols.va}::real[], ${cols.vd}::real[],
          ${cols.ve}::real[], ${cols.vc}::real[], ${cols.vb1}::real[], ${cols.vb2}::real[],
          ${cols.vb6}::real[], ${cols.vb9}::real[], ${cols.vb12}::real[], ${cols.tf}::real[],
          ${cols.as}::real[], ${cols.st}::real[], ${cols.pd}::date[]
        ) AS t(name_en, category, source, source_id, serving_size, serving_unit,
          calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium,
          calcium_100g, iron_100g, magnesium_100g, phosphorus_100g, zinc_100g, copper_100g,
          manganese_100g, selenium_100g, vitamin_a_100g, vitamin_d_100g, vitamin_e_100g,
          vitamin_c_100g, vitamin_b1_100g, vitamin_b2_100g, vitamin_b6_100g, vitamin_b9_100g,
          vitamin_b12_100g, trans_fat_100g, added_sugars_100g, starch_100g, publication_date)
        ON CONFLICT (source, source_id) DO NOTHING
      `)
      imported += batch.length
    } catch (err: any) {
      errors += batch.length
      if (errors <= 3) console.error(`[${source}] ${err.message?.slice(0, 120)}`)
    }
    if (imported % 10000 === 0) console.log(`[${source}] ${imported} imported`)
  }
  console.log(`[${source}] Done! ${imported} imported, ${errors} errors`)
}

async function importBranded(limit: number) {
  console.log("\n[usda_branded] Starting...")
  const foods = await loadCSV(`${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv`)
  const nutrients = await loadCSV(`${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv`)
  console.log(`[usda_branded] ${foods.length} foods, ${nutrients.length} nutrients`)

  const nMap = new Map<string, Record<string, number>>()
  for (const n of nutrients) {
    const col = BRANDED_NUTRIENT_MAP[n.nutrient_id]
    const amt = parseFloat(n.amount)
    if (col && !isNaN(amt)) {
      if (!nMap.has(n.fdc_id)) nMap.set(n.fdc_id, {})
      nMap.get(n.fdc_id)![col] = amt
    }
  }

  let imported = 0, errors = 0
  const max = limit > 0 ? Math.min(limit, foods.length) : foods.length

  for (let i = 0; i < max; i += BATCH_SIZE) {
    const batch = foods.slice(i, i + BATCH_SIZE)
    const cols: Record<string, any[]> = {
      fdc:[], names:[], bo:[], bn:[], gtin:[], cat:[], ss:[], su:[], ing:[],
      cal:[], pro:[], carb:[], fat:[], fib:[], sug:[], sod:[], sat:[], chol:[], pot:[],
    }
    for (const f of batch) {
      const n = nMap.get(f.fdc_id) || {}
      cols.fdc.push(f.fdc_id)
      cols.names.push((f.description || "Unknown").slice(0, 500))
      cols.bo.push(f.brand_owner || null)
      cols.bn.push(f.brand_name || null)
      cols.gtin.push(f.gtin_upc || null)
      cols.cat.push(f.branded_food_category || null)
      cols.ss.push(parseFloat(f.serving_size) || null)
      cols.su.push(f.serving_size_unit || null)
      cols.ing.push(f.ingredients || null)
      cols.cal.push(n.calories || 0); cols.pro.push(n.protein || 0)
      cols.carb.push(n.carbs || 0); cols.fat.push(n.fat || 0)
      cols.fib.push(n.fiber || 0); cols.sug.push(n.sugar || 0)
      cols.sod.push(n.sodium || 0); cols.sat.push(n.saturated_fat || 0)
      cols.chol.push(n.cholesterol || 0); cols.pot.push(n.potassium || 0)
    }
    try {
      await db.execute(sql`
        INSERT INTO branded_foods (fdc_id, name_en, brand_owner, brand_name, gtin_upc,
          branded_food_category, serving_size, serving_size_unit, ingredients_text,
          calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium)
        SELECT * FROM UNNEST(
          ${cols.fdc}::text[], ${cols.names}::text[], ${cols.bo}::text[], ${cols.bn}::text[],
          ${cols.gtin}::text[], ${cols.cat}::text[], ${cols.ss}::real[], ${cols.su}::text[],
          ${cols.ing}::text[], ${cols.cal}::real[], ${cols.pro}::real[], ${cols.carb}::real[],
          ${cols.fat}::real[], ${cols.fib}::real[], ${cols.sug}::real[], ${cols.sod}::real[],
          ${cols.sat}::real[], ${cols.chol}::real[], ${cols.pot}::real[]
        ) AS t(fdc_id, name_en, brand_owner, brand_name, gtin_upc, branded_food_category,
          serving_size, serving_size_unit, ingredients_text,
          calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium)
        ON CONFLICT (fdc_id) DO NOTHING
      `)
      imported += batch.length
    } catch (err: any) {
      errors += batch.length
      if (errors <= 3) console.error(`[usda_branded] ${err.message?.slice(0, 120)}`)
    }
    if (imported % 20000 === 0) console.log(`[usda_branded] ${imported} imported`)
  }
  console.log(`[usda_branded] Done! ${imported} imported, ${errors} errors`)
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0"))

  console.log("========================================")
  console.log("  Master Food Database Import")
  console.log("========================================")

  // Step 1: Truncate
  console.log("\n[1/4] Truncating existing data...")
  await db.execute(sql`TRUNCATE foods, branded_foods RESTART IDENTITY CASCADE`)
  console.log("[1/4] Done!")

  // Step 2: USDA Foundation
  console.log("\n[2/4] Importing USDA Foundation Foods...")
  await importUSDA("usda_foundation",
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv`,
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv`,
    limit)

  // Step 3: USDA SR Legacy
  console.log("\n[3/4] Importing USDA SR Legacy Foods...")
  await importUSDA("usda_sr_legacy",
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food.csv`,
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv`,
    limit)

  // Step 4: USDA Branded
  console.log("\n[4/4] Importing USDA Branded Foods...")
  await importBranded(limit)

  // Final stats
  const foodCount = await db.execute(sql`SELECT count(*) FROM foods`)
  const brandedCount = await db.execute(sql`SELECT count(*) FROM branded_foods`)
  console.log("\n========================================")
  console.log("  Import Complete!")
  console.log(`  Foods: ${foodCount.rows[0].count}`)
  console.log(`  Branded: ${brandedCount.rows[0].count}`)
  console.log("========================================")
}

main().catch(console.error)

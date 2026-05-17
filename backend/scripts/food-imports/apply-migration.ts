import { db } from "../../src/db"
import { sql } from "drizzle-orm"
import { readFileSync } from "fs"

async function main() {
  console.log("[Migration] Applying 0012_expand_foods_table.sql...")
  try {
    const sqlContent = readFileSync("../../src/db/migrations/0012_expand_foods_table.sql", "utf-8")
    // Split by semicolons and execute each statement
    const statements = sqlContent.split(/;\s*$/m).filter(s => s.trim())
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim()
      if (stmt) {
        try {
          await db.execute(sql.raw(stmt))
        } catch (err: any) {
          // Skip "already exists" errors
          if (!err.message?.includes("already exists") && !err.message?.includes("duplicate")) {
            console.warn(`[Migration] Warning in statement ${i + 1}:`, err.message?.slice(0, 100))
          }
        }
      }
    }
    console.log("[Migration] Done!")
  } catch (err: any) {
    console.error("[Migration] Error:", err.message)
  }
}

main()

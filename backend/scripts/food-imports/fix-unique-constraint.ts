import { db } from "./src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Migration] Adding unique constraint on (source, source_id)...")
  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_foods_source_source_id'
        ) THEN
          ALTER TABLE foods
            ADD CONSTRAINT uq_foods_source_source_id
            UNIQUE (source, source_id);
        END IF;
      END $$;
    `)
    console.log("[Migration] Unique constraint added successfully!")
  } catch (err: any) {
    console.error("[Migration] Error:", err.message)
  }
}

main()

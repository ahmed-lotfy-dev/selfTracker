import { SQLiteDatabase } from "expo-sqlite";
import journal from "../../drizzle/meta/_journal.json";
import m0000 from "../../drizzle/0000_colossal_surge.sql";
import m0001 from "../../drizzle/0001_pretty_machine_man.sql";

const migrations = {
  m0000,
  m0001,
};

export function runMigrations(db: SQLiteDatabase): void {
  try {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS __drizzle_migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hash TEXT NOT NULL,
          created_at INTEGER
        )
      `);
    } catch (e: any) {
      console.log("[Migrations] Migration table may already exist:", e.message);
    }

    let appliedMigrations: { hash: string }[] = [];
    try {
      appliedMigrations = db.getAllSync<{ hash: string }>(
        "SELECT hash FROM __drizzle_migrations"
      );
    } catch {
      appliedMigrations = [];
    }
    const appliedHashes = new Set(appliedMigrations.map((m) => m.hash));

    for (const entry of journal.entries) {
      if (!appliedHashes.has(entry.tag)) {
        console.log(`[Migrations] Applying migration: ${entry.tag}`);

        const migrationKey = `m${entry.idx.toString().padStart(4, "0")}`;
        const sql = migrations[migrationKey as keyof typeof migrations];

        if (sql) {
          try {
            db.execSync(sql);
            console.log(`[Migrations] ✓ Applied ${entry.tag}`);
          } catch (migrationError: any) {
            if (migrationError?.message?.includes("already exists")) {
              console.log(`[Migrations] ⚠ Tables already exist, marking ${entry.tag} as applied`);
            } else {
              console.error(`[Migrations] Failed to apply ${entry.tag}:`, migrationError.message);
              continue;
            }
          }

          try {
            db.runSync(
              "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
              [entry.tag, Date.now()]
            );
          } catch {
            console.log(`[Migrations] Could not mark ${entry.tag} as applied`);
          }
        }
      }
    }

    console.log("[Migrations] All migrations up to date");
  } catch (error: any) {
    console.error("[Migrations] Error running migrations:", error.message);
  }
}

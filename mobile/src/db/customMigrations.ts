import { SQLiteDatabase } from "expo-sqlite";
import journal from "../../drizzle/meta/_journal.json";

const m0000 = `CREATE TABLE IF NOT EXISTS \`sync_queue\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`action\` text NOT NULL,
	\`table_name\` text NOT NULL,
	\`row_id\` text NOT NULL,
	\`data\` text,
	\`created_at\` integer NOT NULL
);
CREATE TABLE IF NOT EXISTS \`tasks\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`title\` text NOT NULL,
	\`completed\` integer DEFAULT false NOT NULL,
	\`due_date\` text,
	\`category\` text NOT NULL,
	\`created_at\` text NOT NULL,
	\`updated_at\` integer,
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`user_goals\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`goal_type\` text NOT NULL,
	\`target_value\` integer NOT NULL,
	\`deadline\` integer,
	\`achieved\` integer DEFAULT false,
	\`created_at\` text NOT NULL,
	\`updated_at\` integer,
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`weight_logs\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`weight\` integer NOT NULL,
	\`mood\` text,
	\`energy\` text,
	\`notes\` text,
	\`created_at\` text NOT NULL,
	\`updated_at\` integer,
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`workout_logs\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`workout_id\` text NOT NULL,
	\`workout_name\` text NOT NULL,
	\`notes\` text,
	\`created_at\` text NOT NULL,
	\`updated_at\` integer,
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`workouts\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`training_split_id\` text,
	\`created_at\` text,
	\`updated_at\` text
);`;

const m0001 = `CREATE TABLE IF NOT EXISTS \`exercises\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`description\` text,
	\`created_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`updated_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`deleted_at\` integer
);
CREATE TABLE IF NOT EXISTS \`expenses\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`category\` text NOT NULL,
	\`amount\` text NOT NULL,
	\`description\` text,
	\`created_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`updated_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`project_columns\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`project_id\` text NOT NULL,
	\`name\` text NOT NULL,
	\`order\` integer DEFAULT 0 NOT NULL,
	\`type\` text DEFAULT 'todo',
	\`created_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`updated_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`projects\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`name\` text NOT NULL,
	\`color\` text DEFAULT '#000000',
	\`is_archived\` integer DEFAULT false,
	\`created_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`updated_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`timer_sessions\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`user_id\` text NOT NULL,
	\`task_id\` text,
	\`start_time\` integer NOT NULL,
	\`end_time\` integer,
	\`duration\` integer,
	\`type\` text DEFAULT 'focus',
	\`completed\` integer DEFAULT false,
	\`created_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`updated_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`deleted_at\` integer,
	\`sync_status\` text DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS \`training_splits\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`description\` text,
	\`created_by\` text,
	\`is_public\` integer DEFAULT true,
	\`created_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`updated_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`deleted_at\` integer
);
CREATE TABLE IF NOT EXISTS \`workout_exercises\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`workout_id\` text NOT NULL,
	\`exercise_id\` text NOT NULL,
	\`sets\` integer NOT NULL,
	\`reps\` integer NOT NULL,
	\`weight\` text NOT NULL,
	\`created_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`updated_at\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	\`deleted_at\` integer
);`;

const migrations: Record<string, string> = {
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
    } catch (e: any) { }

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
        const migrationKey = `m${entry.idx.toString().padStart(4, "0")}`;
        const sql = migrations[migrationKey];

        if (sql) {
          const statements = sql.split(/;\s*(?=CREATE|ALTER|DROP|INSERT|PRAGMA)/);

          for (const statement of statements) {
            const trimmed = statement.trim();
            if (trimmed) {
              try {
                db.execSync(trimmed);
              } catch (migrationError: any) {
                if (!migrationError?.message?.includes("already exists")) {
                  console.error(`[Migrations] Failed statement:`, migrationError.message);
                }
              }
            }
          }

          try {
            db.runSync(
              "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
              [entry.tag, Date.now()]
            );
          } catch { }
        }
      }
    }

  } catch (error: any) {
    console.error("[Migrations] Error running migrations:", error.message);
  }
}

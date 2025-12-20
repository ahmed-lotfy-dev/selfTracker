import { dbManager, getDb } from "./dbManager";
import migrations from "../../drizzle/migrations";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

/**
 * Database client with per-user isolation
 * 
 * IMPORTANT: The database is now user-specific. It must be initialized
 * when a user logs in via dbManager.initializeUserDatabase(userId)
 */

// Export the database manager for initialization
export { dbManager };

// Export dynamic database getter
// This will throw an error if no user is logged in
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(target, prop) {
    const currentDb = getDb();
    return currentDb[prop as keyof typeof currentDb];
  }
});

// Migration hook for React components
export const useDatabaseMigrations = () => {
  // Run migrations on the current user's database
  try {
    const currentDb = dbManager.isInitialized() ? dbManager.getCurrentDatabase() : null;
    if (currentDb) {
      return useMigrations(currentDb, migrations);
    }
  } catch (e) {
    console.error("[DB] Migration error:", e);
  }
  return { success: false, error: undefined };
};

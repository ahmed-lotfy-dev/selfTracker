import { dbManager, getDb } from "./dbManager";
import migrations from "../../drizzle/migrations";

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
  // Migrations are now handled automatically by dbManager
  // This hook is kept for backward compatibility
  return { success: true, error: undefined };
};

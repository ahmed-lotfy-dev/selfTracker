import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";
import { runMigrations } from "./customMigrations";

/**
 * Database Manager for Per-User Database Isolation
 * 
 * This manager ensures each user has their own SQLite database file,
 * preventing data leakage between user accounts.
 */

class DatabaseManager {
  private currentDb: ReturnType<typeof drizzle> | null = null;
  private currentExpoDb: SQLiteDatabase | null = null;
  private currentUserId: string | null = null;

  /**
   * Get database path for a specific user
   */
  private getUserDbPath(userId: string): string {
    return `selftracker_user_${userId}.db`;
  }

  /**
   * Initialize database for a specific user
   */
  async initializeUserDatabase(userId: string): Promise<ReturnType<typeof drizzle>> {
    if (this.currentUserId === userId && this.currentDb) {
      return this.currentDb;
    }

    if (this.currentExpoDb) {
      this.closeCurrentDatabase();
    }

    const dbPath = this.getUserDbPath(userId);
    console.time("DB_INIT");

    try {
      const expoDb = openDatabaseSync(dbPath);

      runMigrations(expoDb);

      const db = drizzle(expoDb);

      console.timeEnd("DB_INIT");

      this.currentExpoDb = expoDb;
      this.currentDb = db;
      this.currentUserId = userId;

      return db;
    } catch (error: any) {
      console.error(`[DB Manager] Failed to initialize database:`, error.message);
      throw error;
    }
  }

  /**
   * Get current user's database instance
   * Throws error if no database is initialized
   */
  getCurrentDatabase(): ReturnType<typeof drizzle> {
    if (!this.currentDb || !this.currentUserId) {
      throw new Error("No database initialized. User must be logged in.");
    }
    return this.currentDb;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Close current database connection
   */
  closeCurrentDatabase(): void {
    if (this.currentExpoDb) {
      this.currentExpoDb.closeSync();
      this.currentExpoDb = null;
      this.currentDb = null;
      this.currentUserId = null;
    }
  }

  /**
   * Check if a database is currently initialized
   */
  isInitialized(): boolean {
    return this.currentDb !== null && this.currentUserId !== null;
  }
}

// Export singleton instance
export const dbManager = new DatabaseManager();

// Export convenience function for getting current database
export const getDb = () => dbManager.getCurrentDatabase();

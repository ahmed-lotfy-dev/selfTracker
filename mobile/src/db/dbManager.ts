import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";
import migrations from "../../drizzle/migrations";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

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
    // If already initialized for this user, return existing instance
    if (this.currentUserId === userId && this.currentDb) {
      return this.currentDb;
    }

    // Close existing database if switching users
    if (this.currentExpoDb) {
      this.closeCurrentDatabase();
    }

    // Open user-specific database
    const dbPath = this.getUserDbPath(userId);
    console.log(`[DB Manager] Opening database: ${dbPath}`);

    const expoDb = openDatabaseSync(dbPath);
    const db = drizzle(expoDb);

    // Run migrations
    console.log(`[DB Manager] Running migrations for user: ${userId}`);
    await migrate(db, migrations);

    // Store current database instance
    this.currentExpoDb = expoDb;
    this.currentDb = db;
    this.currentUserId = userId;

    return db;
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
      console.log(`[DB Manager] Closing database for user: ${this.currentUserId}`);
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

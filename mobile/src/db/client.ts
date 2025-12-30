import { ShapeStream, Message } from '@electric-sql/client'
import * as SQLite from 'expo-sqlite'
import { useAuthStore } from "@/src/features/auth/useAuthStore"

import { API_BASE_URL } from "@/src/lib/api/config"

export class ElectricSync {
  private db: SQLite.SQLiteDatabase
  private onBatchApplied?: (tableName: string) => void

  constructor(db: SQLite.SQLiteDatabase, onBatchApplied?: (tableName: string) => void) {
    this.db = db
    this.onBatchApplied = onBatchApplied
  }

  private subscriptions: (() => void)[] = []

  async syncTable(tableName: string, options?: { where?: string }) {
    // console.log(`[ElectricSync] Starting sync for table: ${tableName}`)

    const token = useAuthStore.getState().token;
    // console.log(`[ElectricSync] Syncing ${tableName} with token: ${token ? 'PRESENT' : 'MISSING'} (${token?.substring(0, 10)}...)`);

    try {
      // Use Backend Proxy: [API_BASE_URL]/api/electric/[tableName]
      // The backend adds the auth token check and injects the 'where user_id=...' clause.
      let url = `${API_BASE_URL}/api/electric/${tableName}?offset=-1`;

      if (options?.where) {
        url += `&where=${encodeURIComponent(options.where)}`;
      }

      // console.log(`[ElectricSync] Connecting to Proxy: ${url}`);

      const stream = new ShapeStream({
        url,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const unsubscribe = stream.subscribe((messages) => {
        this.applyMessages(tableName, messages as Message[])
      })
      this.subscriptions.push(unsubscribe)

    } catch (e) {
      console.error(`[ElectricSync] Error syncing ${tableName}:`, e)
    }
  }

  stop() {
    // console.log('[ElectricSync] Stopping all active sync streams...')
    this.subscriptions.forEach(unsub => unsub())
    this.subscriptions = []
  }

  private dbLock = Promise.resolve()

  private async applyMessages(tableName: string, messages: Message[]) {
    // Chain all database operations to ensure sequential execution.
    // SQLite can only handle one transaction at a time.
    this.dbLock = this.dbLock.then(async () => {
      const hasControl = messages.some((m: any) => m.headers?.control)
      const dataMessages = messages.filter((m: any) => m.value)

      if (dataMessages.length > 0) {
        // console.log(`[ElectricSync] 🟢 ${tableName}: Received ${dataMessages.length} data rows`)
      } else if (hasControl) {
        return // Don't process empty transaction
      } else {
        return
      }

      // Retry loop for "database is locked" errors
      const MAX_RETRIES = 5;
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        try {
          await this.db.withTransactionAsync(async () => {
            for (const msg of messages) {
              // Type assertion to handle generic message structure
              const m = msg as any

              if (m.headers?.control === 'up-to-date') {
                continue
              }

              const operation = m.headers?.operation
              const value = m.value

              if (!operation && !value) continue // control message?

              if (operation === 'insert' || operation === 'update') {
                await this.upsert(tableName, value)
              } else if (operation === 'delete') {
                await this.delete(tableName, value.id)
              }
            }
          })

          this.onBatchApplied?.(tableName)
          return; // Success, exit retry loop

        } catch (e: any) {
          // Robust check for locked database using string representation to catch nested causes
          const errStr = String(e) + (e?.message || '');
          const isLocked = errStr.includes('database is locked') || errStr.includes('database locked') || errStr.includes('SQLITE_BUSY');

          if (isLocked && attempt < MAX_RETRIES - 1) {
            attempt++;
            const delay = Math.random() * 250 + (attempt * 100); // Random backoff 100-600ms

            // Only warn on later attempts to reduce log noise
            if (attempt > 1) {
              console.warn(`[ElectricSync] 🛑 DB Locked for ${tableName}. Retrying (${attempt}/${MAX_RETRIES}) in ${delay.toFixed(0)}ms...`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            if (!isLocked) {
              // Log non-lock errors clearly
              console.log(`[ElectricSync] ❌ Sync Error (${tableName}): ${errStr}`);
            } else {
              console.error(`[ElectricSync] 💥 Failed to apply batch to ${tableName} after ${attempt + 1} attempts due to lock.`);
            }
            throw e // Give up
          }
        }
      }
    }).catch(err => {
      // Catch any error in the chain itself to prevent breaking the lock for future tasks
      console.error(`[ElectricSync] Unexpected error in transaction lock for ${tableName}:`, err)
    })

    // Await the current operation specifically (optional, since the chain handles ordering)
    await this.dbLock
  }

  private async upsert(tableName: string, data: any) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => '?').join(',')
    const escapedKeys = keys.map(k => `"${k}"`).join(',')

    // We must use ON CONFLICT DO UPDATE to support partial updates (merges)
    // otherwise INSERT OR REPLACE wipes out missing columns (like title/name)
    const updateSet = keys
      .filter(k => k !== 'id') // Don't update the ID (conflict target)
      .map(k => `"${k}" = excluded."${k}"`)
      .join(',')

    // Fallback: If it's a new row, INSERT works. 
    // If it's an existing row, UPDATE only the provided fields.
    // Note: This requires the table to have a Primary Key ID.

    let query = `INSERT INTO ${tableName} (${escapedKeys}) VALUES (${placeholders})`
    if (updateSet.length > 0) {
      query += ` ON CONFLICT(id) DO UPDATE SET ${updateSet}`
    } else {
      // If only ID is provided (rare edge case), DO NOTHING on conflict
      query += ` ON CONFLICT(id) DO NOTHING`
    }

    // console.log(`[ElectricSync] Upserting into ${tableName}:`, keys) // Debug log

    const safeValues = values.map(v => {
      if (v === undefined) return null
      if (typeof v === 'boolean') return v ? 1 : 0
      return v
    })

    try {
      await this.db.runAsync(query, safeValues as any[])
    } catch (e) {
      console.error(`[ElectricSync] Upsert failed for ${tableName}. Query: ${query}. Keys: ${JSON.stringify(keys)}`, e)
      throw e // Re-throw to fail the transaction
    }
  }

  private async delete(tableName: string, id: string) {
    await this.db.runAsync(`DELETE FROM ${tableName} WHERE id = ?`, [id])
  }
}

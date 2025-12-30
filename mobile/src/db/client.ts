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

  async syncTable(tableName: string) {
    // console.log(`[ElectricSync] Starting sync for table: ${tableName}`)

    const token = useAuthStore.getState().token;
    // console.log(`[ElectricSync] Syncing ${tableName} with token: ${token ? 'PRESENT' : 'MISSING'} (${token?.substring(0, 10)}...)`);

    try {
      // Use Backend Proxy: [API_BASE_URL]/api/electric/[tableName]
      // The backend adds the auth token check and injects the 'where user_id=...' clause.
      const url = `${API_BASE_URL}/api/electric/${tableName}?offset=-1`;
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
        // console.log(`[ElectricSync] ⚪ ${tableName}: Up to date (No new data)`)
        return // Don't process empty transaction
      } else {
        return
      }

      // console.log(`[ElectricSync] First message sample:`, JSON.stringify(messages[0]));

      // Batch operations
      try {
        await this.db.withTransactionAsync(async () => {
          for (const msg of messages) {
            // Type assertion to handle generic message structure
            const m = msg as any

            if (m.headers?.control === 'up-to-date') {
              // Sync caught up
              // console.log(`[ElectricSync] ${tableName} is up to date.`)
              continue
            }

            const operation = m.headers?.operation
            const value = m.value

            if (!operation && !value) continue // control message?

            if (operation === 'insert' || operation === 'update') {
              // console.log(`[ElectricSync] 📥 Syncing Row to SQLite (${tableName}):`, JSON.stringify(value))
              await this.upsert(tableName, value)
            } else if (operation === 'delete') {
              await this.delete(tableName, value.id)
            }
          }
        })
        this.onBatchApplied?.(tableName)
      } catch (e) {
        console.error(`[ElectricSync] Failed to apply batch to ${tableName}`, e)
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

    const safeValues = values.map(v => (typeof v === 'boolean' ? (v ? 1 : 0) : v))

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

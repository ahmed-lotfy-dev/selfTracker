import { API_BASE_URL } from '../lib/api/axiosInstance'

type DatabaseType = Awaited<ReturnType<typeof import("@tauri-apps/plugin-sql").default.load>>;

export class TauriSQLiteAdapter {
  private db: DatabaseType | null = null
  private dbName: string

  constructor(dbName: string) {
    this.dbName = "sqlite:" + dbName
  }

  async init() {
    if (!this.db) {
      const { default: Database } = await import("@tauri-apps/plugin-sql")
      this.db = await Database.load(this.dbName)
    }
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) await this.init()
    return await this.db!.select<T[]>(sql, params)
  }

  async runAsync(
    sql: string,
    params: any[] = []
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (!this.db) await this.init()
    const result = await this.db!.execute(sql, params)
    return {
      changes: result.rowsAffected,
      lastInsertRowId: result.lastInsertId ?? 0,
    }
  }

  async execAsync(sql: string): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.execute(sql)
  }

  // Basic transaction support using SQL commands
  async withTransactionAsync<T>(
    callback: (tx: TauriSQLiteAdapter) => Promise<T>
  ): Promise<T> {
    if (!this.db) await this.init()
    try {
      // NOTE: Tauri's execute is atomic for single statements, but for transaction wrapping we use BEGIN/COMMIT explicitly.
      await this.db!.execute("BEGIN TRANSACTION")
      const result = await callback(this)
      await this.db!.execute("COMMIT")
      return result
    } catch (error) {
      await this.db!.execute("ROLLBACK")
      throw error
    }
  }

  async withExclusiveTransactionAsync<T>(
    callback: (tx: TauriSQLiteAdapter) => Promise<T>
  ): Promise<T> {
    // Alias to normal transaction for now
    return this.withTransactionAsync(callback)
  }
}

export const db = new TauriSQLiteAdapter("self_tracker_v1.db")

export class ElectricSync {
  private db: TauriSQLiteAdapter
  private onBatchApplied?: (tableName: string) => void

  constructor(db: TauriSQLiteAdapter, onBatchApplied?: (tableName: string) => void) {
    this.db = db
    this.onBatchApplied = onBatchApplied
  }

  private subscriptions: (() => void)[] = []

  async syncTable(tableName: string) {
    console.log(`[ElectricSync] Starting sync for table: ${tableName}`)

    const token = localStorage.getItem("bearer_token");
    console.log(`[ElectricSync] Syncing ${tableName} with token: ${token ? 'PRESENT' : 'MISSING'} (${token?.substring(0, 10)}...)`);

    try {
      const { ShapeStream } = await import('@electric-sql/client')

      const url = `${API_BASE_URL}/api/electric/${tableName}?offset=-1`;
      console.log(`[ElectricSync] Connecting to Proxy: ${url}`);

      const stream = new ShapeStream({
        url,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const unsubscribe = stream.subscribe((messages: any[]) => {
        this.applyMessages(tableName, messages)
      })
      this.subscriptions.push(unsubscribe)

    } catch (e) {
      console.error(`[ElectricSync] Error syncing ${tableName}:`, e)
    }
  }

  stop() {
    console.log('[ElectricSync] Stopping all active sync streams...')
    this.subscriptions.forEach(unsub => unsub())
    this.subscriptions = []
  }

  private dbLock = Promise.resolve()

  private async applyMessages(tableName: string, messages: any[]) {
    this.dbLock = this.dbLock.then(async () => {
      const hasControl = messages.some((m: any) => m.headers?.control)
      const dataMessages = messages.filter((m: any) => m.value)

      if (dataMessages.length > 0) {
        console.log(`[ElectricSync] 🟢 ${tableName}: Received ${dataMessages.length} data rows`)
      } else if (hasControl) {
        // console.log(`[ElectricSync] ⚪ ${tableName}: Up to date (No new data)`) // reduce noise
        return
      } else {
        return
      }

      await this.db.withTransactionAsync(async () => {
        for (const msg of messages) {
          const m = msg as any

          if (m.headers?.control === 'up-to-date') {
            console.log(`[ElectricSync] ${tableName} is up to date.`)
            continue
          }

          const operation = m.headers?.operation
          const value = m.value

          if (!operation && !value) continue

          if (operation === 'insert' || operation === 'update') {
            await this.upsert(tableName, value)
          } else if (operation === 'delete') {
            await this.delete(tableName, value.id)
          }
        }
      })
      this.onBatchApplied?.(tableName)
    }).catch(err => {
      console.error(`[ElectricSync] Unexpected error in transaction lock for ${tableName}:`, err)
    })

    await this.dbLock
  }

  private async upsert(tableName: string, data: any) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => '?').join(',')
    const escapedKeys = keys.map(k => `"${k}"`).join(',')

    const updateSet = keys
      .filter(k => k !== 'id')
      .map(k => `"${k}" = excluded."${k}"`)
      .join(',')

    let query = `INSERT INTO ${tableName} (${escapedKeys}) VALUES (${placeholders})`
    if (updateSet.length > 0) {
      query += ` ON CONFLICT(id) DO UPDATE SET ${updateSet}`
    } else {
      query += ` ON CONFLICT(id) DO NOTHING`
    }

    const safeValues = values.map(v => (typeof v === 'boolean' ? (v ? 1 : 0) : v))

    await this.db.runAsync(query, safeValues as any[])
  }

  private async delete(tableName: string, id: string) {
    await this.db.runAsync(`DELETE FROM ${tableName} WHERE id = ?`, [id])
  }
}

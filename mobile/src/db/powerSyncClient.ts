/**
 * PowerSync client for SelfTracker
 * Replaces ElectricSync + SyncManager.
 * PowerSync handles both reads AND writes automatically — no manual push/retry queues.
 */
import { PowerSyncDatabase } from '@powersync/react-native'
import { Schema, Table, Column, ColumnType, AbstractPowerSyncDatabase } from '@powersync/common'
import type { PowerSyncBackendConnector, PowerSyncCredentials } from '@powersync/common'
import { useAuthStore } from '@/src/features/auth/useAuthStore'
import axiosInstance from '@/src/lib/api/axiosInstance'

// ── Schema ──────────────────────────────────────────────────────────

const AppSchema = new Schema([
  new Table({
    name: 'tasks',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'title', type: ColumnType.TEXT }),
      new Column({ name: 'completed', type: ColumnType.INTEGER }),
      new Column({ name: 'completed_at', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
      new Column({ name: 'updated_at', type: ColumnType.TEXT }),
      new Column({ name: 'deleted_at', type: ColumnType.TEXT }),
      new Column({ name: 'category', type: ColumnType.TEXT }),
      new Column({ name: 'priority', type: ColumnType.TEXT }),
      new Column({ name: 'column_id', type: ColumnType.TEXT }),
      new Column({ name: 'description', type: ColumnType.TEXT }),
      new Column({ name: 'due_date', type: ColumnType.TEXT }),
      new Column({ name: 'project_id', type: ColumnType.TEXT }),
      new Column({ name: 'order', type: ColumnType.INTEGER }),
    ],
  }),
  new Table({
    name: 'habits',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'description', type: ColumnType.TEXT }),
      new Column({ name: 'streak', type: ColumnType.INTEGER }),
      new Column({ name: 'color', type: ColumnType.TEXT }),
      new Column({ name: 'completed_today', type: ColumnType.INTEGER }),
      new Column({ name: 'last_completed_at', type: ColumnType.TEXT }),
      new Column({ name: 'completion_dates', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
      new Column({ name: 'updated_at', type: ColumnType.TEXT }),
      new Column({ name: 'deleted_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'workouts',
    columns: [
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'training_split_id', type: ColumnType.TEXT }),
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
      new Column({ name: 'updated_at', type: ColumnType.TEXT }),
      new Column({ name: 'is_public', type: ColumnType.INTEGER }),
      new Column({ name: 'deleted_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'workout_logs',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'workout_id', type: ColumnType.TEXT }),
      new Column({ name: 'workout_name', type: ColumnType.TEXT }),
      new Column({ name: 'notes', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
      new Column({ name: 'updated_at', type: ColumnType.TEXT }),
      new Column({ name: 'deleted_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'weight_logs',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'weight', type: ColumnType.TEXT }),
      new Column({ name: 'notes', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
      new Column({ name: 'updated_at', type: ColumnType.TEXT }),
      new Column({ name: 'deleted_at', type: ColumnType.TEXT }),
      new Column({ name: 'energy', type: ColumnType.TEXT }),
      new Column({ name: 'mood', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'food_logs',
    columns: [
      new Column({ name: 'user_id', type: ColumnType.TEXT }),
      new Column({ name: 'logged_at', type: ColumnType.TEXT }),
      new Column({ name: 'meal_type', type: ColumnType.TEXT }),
      new Column({ name: 'food_items', type: ColumnType.TEXT }),
      new Column({ name: 'total_calories', type: ColumnType.INTEGER }),
      new Column({ name: 'total_protein', type: ColumnType.INTEGER }),
      new Column({ name: 'total_carbs', type: ColumnType.INTEGER }),
      new Column({ name: 'total_fat', type: ColumnType.INTEGER }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
      new Column({ name: 'updated_at', type: ColumnType.TEXT }),
      new Column({ name: 'deleted_at', type: ColumnType.TEXT }),
    ],
  }),
])

// ── Backend Connector ───────────────────────────────────────────────

class SelfTrackerBackendConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    const token = useAuthStore.getState().token
    if (!token) return null

    return {
      endpoint: process.env.EXPO_PUBLIC_POWER_SYNC_URL || 'https://powersync.ahmedlotfy.site',
      token,
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const batch = await database.getCrudBatch(100)
    if (!batch) return

    for (const op of batch.crud) {
      try {
        await this.uploadOperation(op)
      } catch (e) {
        console.error('[PowerSync] Upload failed for', op.op, op.table, op.id, e)
        throw e
      }
    }

    await batch.complete()
  }

  private async uploadOperation(op: any): Promise<void> {
    const table = op.table
    const data = op.opData || {}

    switch (op.op) {
      case 'PUT':
        await axiosInstance.post(`/api/${table}`, { id: op.id, ...data })
        break
      case 'PATCH':
        await axiosInstance.patch(`/api/${table}/${op.id}`, data)
        break
      case 'DELETE':
        await axiosInstance.delete(`/api/${table}/${op.id}`)
        break
    }
  }
}

// ── Singleton ───────────────────────────────────────────────────────

let db: PowerSyncDatabase | null = null
let connector: SelfTrackerBackendConnector | null = null

export async function getPowerSyncDB(): Promise<PowerSyncDatabase> {
  if (db) return db

  connector = new SelfTrackerBackendConnector()

  db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: 'selftracker_ps.db',
    },
  })

  await db.connect(connector)
  console.log('[PowerSync] ✅ Connected and syncing')
  return db
}

export async function disconnectPowerSync(): Promise<void> {
  if (db) {
    await db.disconnectAndClear()
    db = null
    connector = null
    console.log('[PowerSync] Disconnected and cleared')
  }
}

export function getPowerSyncInstance(): PowerSyncDatabase | null {
  return db
}

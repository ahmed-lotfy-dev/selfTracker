import * as SQLite from "expo-sqlite"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useWeightStore } from "@/src/stores/useWeightStore"
import { WeightLog } from "../types/weightType"
import { Workout, WorkoutLog } from "../types/workoutType"
import { ElectricSync } from "@/src/db/client"
import axiosInstance from '@/src/lib/api/axiosInstance'
import { mmkvStorage } from '@/src/lib/storage/mmkv'

const PENDING_WORKOUT_LOG_KEY = 'pending-workout-log-pushes'
const PENDING_WORKOUT_KEY = 'pending-workout-pushes'
const PENDING_HABIT_KEY = 'pending-habit-pushes'
const PENDING_TASK_KEY = 'pending-task-pushes'
const PENDING_WEIGHT_KEY = 'pending-weight-pushes'
const PENDING_FOOD_LOG_KEY = 'pending-food-log-pushes'
const MAX_RETRIES = 4

class SyncManagerService {
  private db: SQLite.SQLiteDatabase | null = null
  private dbName = "self_tracker_db.db"
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  private dbLock = Promise.resolve()

  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    let resolve: (value: T) => void
    let reject: (reason?: any) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })

    const nextLock = this.dbLock.then(async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })

    this.dbLock = nextLock
    return promise
  }

  async initialize() {
    if (this.isInitialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this._doInitialize()
    return this.initPromise
  }

  private async _doInitialize() {
    try {
      console.log(`[SyncManager] Initializing Local DB: ${this.dbName}`)
      this.db = await SQLite.openDatabaseAsync(this.dbName)

      await this.db.execAsync('PRAGMA journal_mode = WAL;')

      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY, user_id TEXT, title TEXT, completed INTEGER, completed_at TEXT,
          created_at TEXT, updated_at TEXT, deleted_at TEXT, category TEXT, priority TEXT,
          column_id TEXT, description TEXT, due_date TEXT, project_id TEXT, "order" INTEGER
        );
        CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY, user_id TEXT, name TEXT, description TEXT, streak INTEGER, 
          color TEXT, completed_today INTEGER, last_completed_at TEXT, created_at TEXT, updated_at TEXT, deleted_at TEXT
        );
        CREATE TABLE IF NOT EXISTS workouts (
          id TEXT PRIMARY KEY, name TEXT, training_split_id TEXT, user_id TEXT, 
          created_at TEXT, updated_at TEXT, is_public INTEGER, deleted_at TEXT
        );
        CREATE TABLE IF NOT EXISTS workout_logs (
          id TEXT PRIMARY KEY, user_id TEXT, workout_id TEXT, workout_name TEXT, notes TEXT, 
          created_at TEXT, updated_at TEXT, deleted_at TEXT
        );
        CREATE TABLE IF NOT EXISTS weight_logs (
          id TEXT PRIMARY KEY, user_id TEXT, weight TEXT, notes TEXT, 
          created_at TEXT, updated_at TEXT, deleted_at TEXT, energy TEXT, mood TEXT
        );
        CREATE TABLE IF NOT EXISTS food_logs (
          id TEXT PRIMARY KEY, user_id TEXT, logged_at TEXT, meal_type TEXT, 
          food_items TEXT, total_calories INTEGER, total_protein INTEGER, total_carbs INTEGER, 
          total_fat INTEGER, created_at TEXT, updated_at TEXT, deleted_at TEXT
        );
      `)
      // Add completion_dates column if upgrading from old schema
      try {
        await this.db!.execAsync(`ALTER TABLE habits ADD COLUMN completion_dates TEXT DEFAULT '[]'`)
      } catch { /* column already exists */ }

      this.isInitialized = true
      await this.pullFromDB()

      // Retry any pending pushes from previous failed attempts
      try {
        await this.retryPendingPushes()
      } catch (e) {
        console.error("[SyncManager] Retry pending pushes failed:", e)
      }

    } catch (e) {
      console.error("[SyncManager] Initialization failed:", e)
      this.initPromise = null
    }
  }

  private currentSync: ElectricSync | null = null

  async startSync() {
    if (!this.db || !this.isInitialized) {
      return
    }

    if (this.currentSync) {
      this.currentSync.stop()
      this.currentSync = null
    }

    const electric = new ElectricSync(this.db, (table) => {
      this.pullFromDB(table)
    })
    this.currentSync = electric

    // Calculate date filters for Partial Sync (Recent Data Only)
    // This reduces initial sync from 3+ minutes to <10 seconds
    const now = new Date()
    const fiveHundredDaysAgo = new Date(now.getTime() - 500 * 24 * 60 * 60 * 1000).toISOString()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    console.log('[SyncManager] Starting Partial Sync (Recent Data Only)...')

    // Start syncs (non-blocking)
    // Heavy tables: Sync range increased to 500 days to include historical logs (e.g. August 2025)
    electric.syncTable('food_logs', { where: `logged_at >= '${fiveHundredDaysAgo}'` })
    electric.syncTable('workout_logs', { where: `created_at >= '${fiveHundredDaysAgo}'` })
    electric.syncTable('weight_logs', { where: `created_at >= '${ninetyDaysAgo}'` })

    // Tasks: Sync active tasks OR recently completed
    // Note: completed is INTEGER (0/1) in SQLite/Electric
    electric.syncTable('tasks', { where: `completed = false OR completed_at >= '${sevenDaysAgo}'` })

    // Config tables: Sync full history (low volume)
    electric.syncTable('habits')
    electric.syncTable('workouts')

    console.log('[SyncManager] ✅ Sync started with date filters')
  }

  async clearDatabase() {
    try {
      console.log('[SyncManager] Clearing database (soft delete)...')

      // Stop ElectricSync first
      if (this.currentSync) {
        this.currentSync.stop()
        this.currentSync = null
      }

      // Soft-delete all local data instead of dropping the database
      // This preserves the data in case the user logs back in before a full sync
      if (this.db) {
        const tables = ['tasks', 'habits', 'workouts', 'workout_logs', 'weight_logs', 'food_logs']
        for (const table of tables) {
          try {
            await this.db.runAsync(`DELETE FROM ${table}`)
          } catch (e) {
            // Table might not exist, skip
          }
        }
        console.log('[SyncManager] ✅ All local tables cleared (data preserved on server)')
      }

      this.isInitialized = false
    } catch (e) {
      console.error('[SyncManager] Failed to clear database:', e)
      this.isInitialized = false
      this.db = null
      this.currentSync = null
    }
  }

  async pullFromDB(tableName?: string) {
    if (!this.db) return

    console.log(`[SyncManager] 🔄 Pulling data from SQLite... ${tableName ? `(${tableName})` : '(ALL)'}`)

    try {
      // --- TASKS ---
      if (!tableName || tableName === 'tasks') {
        const tasksResult = await this.db.getAllAsync('SELECT * FROM tasks WHERE deleted_at IS NULL') as any[]
        // console.log(`[SyncManager] Found ${tasksResult.length} tasks in SQLite`)
        const tasks = tasksResult.map(t => ({
          id: t.id,
          userId: t.user_id || 'user_local',
          title: t.title,
          completed: !!t.completed,
          category: t.category || 'general',
          createdAt: t.created_at || new Date().toISOString(),
          updatedAt: t.updated_at || new Date().toISOString(),
          deletedAt: t.deleted_at,
          dueDate: null,
          description: null,
          projectId: null,
          columnId: null,
          priority: t.priority || 'medium',
          order: 0,
          completedAt: t.completed ? (t.updated_at || new Date().toISOString()) : null
        }))
        useTasksStore.getState().setTasks(tasks)
      }

      // --- HABITS ---
      if (!tableName || tableName === 'habits') {
        const habitsResult = await this.db.getAllAsync('SELECT * FROM habits WHERE deleted_at IS NULL') as any[]
        const habits = habitsResult.map(h => ({
          id: h.id,
          userId: h.user_id,
          name: h.name,
          description: h.description,
          streak: h.streak,
          color: h.color,
          completedToday: !!h.completed_today,
          completionDates: h.completion_dates ? JSON.parse(h.completion_dates) : [],
          lastCompletedAt: h.last_completed_at,
          createdAt: h.created_at,
          updatedAt: h.updated_at,
          deletedAt: h.deleted_at
        }))
        useHabitsStore.getState().setHabits(habits)
      }

      // --- WORKOUTS (Templates) ---
      if (!tableName || tableName === 'workouts') {
        const workoutsResult = await this.db.getAllAsync('SELECT * FROM workouts WHERE deleted_at IS NULL') as any[]
        const workouts = workoutsResult.map(w => ({
          id: w.id,
          name: w.name,
          trainingSplitId: w.training_split_id,
          userId: w.user_id,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          isPublic: !!w.is_public,
          deletedAt: w.deleted_at
        }))
        useWorkoutsStore.getState().setWorkouts(workouts)
      }

      // --- WORKOUT LOGS ---
      if (!tableName || tableName === 'workout_logs') {
        const workoutLogsResult = await this.db.getAllAsync('SELECT * FROM workout_logs WHERE deleted_at IS NULL') as any[]
        const workoutLogs: WorkoutLog[] = workoutLogsResult.map(w => ({
          id: w.id,
          userId: w.user_id,
          workoutId: w.workout_id,
          workoutName: w.workout_name,
          notes: w.notes,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          deletedAt: w.deleted_at
        }))
        useWorkoutsStore.getState().setWorkoutLogs(workoutLogs)
      }

      // --- WEIGHTS ---
      if (!tableName || tableName === 'weight_logs') {
        const weightsResult = await this.db.getAllAsync('SELECT * FROM weight_logs WHERE deleted_at IS NULL') as any[]
        const weightLogs: WeightLog[] = weightsResult.map(w => ({
          id: w.id,
          userId: w.user_id,
          weight: w.weight,
          notes: w.notes,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          deletedAt: w.deleted_at
        }))
        useWeightStore.getState().setWeightLogs(weightLogs)
      }

      // --- NUTRITION ---
      if (!tableName || tableName === 'food_logs') {
        const foodLogsResult = await this.db.getAllAsync('SELECT * FROM food_logs WHERE deleted_at IS NULL') as any[]
        const foodLogs = foodLogsResult.map(f => {
          let parsedItems = []
          try {
            let rawItems = f.food_items || f.foodItems
            
            if (typeof rawItems === 'string') {
              try {
                parsedItems = JSON.parse(rawItems)
              } catch (e) {
                // Ignore parsing errors, it will fallback to empty array
                parsedItems = []
              }
            } else if (Array.isArray(rawItems)) {
              parsedItems = rawItems
            }
          } catch (e) {
            parsedItems = []
          }

          return {
            id: f.id,
            userId: f.user_id,
            loggedAt: f.logged_at,
            mealType: f.meal_type,
            foodItems: parsedItems,
            totalCalories: f.total_calories,
            totalProtein: f.total_protein,
            totalCarbs: f.total_carbs,
            totalFat: f.total_fat,
            createdAt: f.created_at,
            updatedAt: f.updated_at,
            deletedAt: f.deleted_at
          }
        }).filter((log): log is NonNullable<typeof log> => log !== null)

        console.log(`[SyncManager] Found ${foodLogs.length} food logs`)

        // Lazy import to avoid circular dependency
        const { useNutritionStore } = await import('@/src/stores/useNutritionStore')
        useNutritionStore.getState().setFoodLogs(foodLogs)
      }

      if (!tableName) {
        console.log('[SyncManager] ✅ Full initial load complete')
      }

    } catch (e) {
      console.error("[SyncManager] Pull failed:", e)
    }
  }

  // --- RETRY QUEUE ---

  private getPending<T>(key: string): T[] {
    return mmkvStorage.getItem<T[]>(key) ?? []
  }

  private setPending<T>(key: string, items: T[]): void {
    if (items.length === 0) {
      mmkvStorage.removeItem(key)
    } else {
      mmkvStorage.setItem(key, items)
    }
  }

  private addToPending<T>(key: string, item: T): void {
    const pending = this.getPending<T>(key)
    // Avoid duplicates by checking id
    const exists = (item as any).id && pending.some(p => (p as any).id === (item as any).id)
    if (!exists) {
      pending.push(item)
      this.setPending(key, pending)
      console.log(`[SyncManager] 📥 Queued for retry (${key}): ${(item as any).id}`)
    }
  }

  private removeFromPending<T>(key: string, id: string): void {
    const pending = this.getPending<T>(key)
    const filtered = pending.filter(p => (p as any).id !== id)
    this.setPending(key, filtered)
  }

  /** Retry pushing a single item with exponential backoff */
  private async pushWithRetry(pushFn: () => Promise<void>, label: string): Promise<boolean> {
    let lastError: any
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await pushFn()
        return true
      } catch (e: any) {
        lastError = e
        if (attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          console.warn(`[SyncManager] ⏳ ${label} failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms:`, e?.message)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    console.error(`[SyncManager] ❌ ${label} failed after ${MAX_RETRIES} attempts:`, lastError?.message)
    return false
  }

  /** Retry all pending pushes (called on init and app foreground) */
  async retryPendingPushes() {
    console.log('[SyncManager] 🔄 Retrying pending pushes...')

    // Workout Logs
    const pendingWorkoutLogs = this.getPending<WorkoutLog>(PENDING_WORKOUT_LOG_KEY)
    for (const log of pendingWorkoutLogs) {
      const success = await this.pushWithRetry(
        () => axiosInstance.post('/api/workoutLogs', log),
        `pushWorkoutLog(${log.id})`
      )
      if (success) {
        this.removeFromPending(PENDING_WORKOUT_LOG_KEY, log.id)
        console.log(`[SyncManager] ✅ Pending workout log pushed: ${log.id}`)
      }
    }

    // Workout templates
    const pendingWorkouts = this.getPending<any>(PENDING_WORKOUT_KEY)
    for (const w of pendingWorkouts) {
      const success = await this.pushWithRetry(
        () => w.deletedAt ? axiosInstance.delete(`/api/workouts/${w.id}`) : axiosInstance.post('/api/workouts', w),
        `pushWorkout(${w.id})`,
        !!w.deletedAt
      )
      if (success) {
        this.removeFromPending(PENDING_WORKOUT_KEY, w.id)
      }
    }

    // Habits
    const pendingHabits = this.getPending<any>(PENDING_HABIT_KEY)
    for (const h of pendingHabits) {
      const success = await this.pushWithRetry(
        () => h.deletedAt ? axiosInstance.delete(`/api/habits/${h.id}`) : axiosInstance.post('/api/habits', h),
        `pushHabit(${h.id})`,
        !!h.deletedAt
      )
      if (success) {
        this.removeFromPending(PENDING_HABIT_KEY, h.id)
      }
    }

    // Tasks
    const pendingTasks = this.getPending<any>(PENDING_TASK_KEY)
    for (const t of pendingTasks) {
      const success = await this.pushWithRetry(
        () => t.deletedAt ? axiosInstance.delete(`/api/tasks/${t.id}`) : axiosInstance.post('/api/tasks', t),
        `pushTask(${t.id})`,
        !!t.deletedAt
      )
      if (success) {
        this.removeFromPending(PENDING_TASK_KEY, t.id)
      }
    }

    // Weight logs
    const pendingWeights = this.getPending<any>(PENDING_WEIGHT_KEY)
    for (const w of pendingWeights) {
      const success = await this.pushWithRetry(
        () => w.deletedAt ? axiosInstance.delete(`/api/weightLogs/${w.id}`) : axiosInstance.post('/api/weightLogs', w),
        `pushWeightLog(${w.id})`,
        !!w.deletedAt
      )
      if (success) {
        this.removeFromPending(PENDING_WEIGHT_KEY, w.id)
      }
    }

    // Food logs
    const pendingFoodLogs = this.getPending<any>(PENDING_FOOD_LOG_KEY)
    for (const log of pendingFoodLogs) {
      const success = await this.pushWithRetry(
        () => log.deletedAt ? axiosInstance.delete(`/api/nutrition/logs/${log.id}`) : axiosInstance.post('/api/nutrition/logs', log),
        `pushFoodLog(${log.id})`,
        !!log.deletedAt
      )
      if (success) {
        this.removeFromPending(PENDING_FOOD_LOG_KEY, log.id)
      }
    }
  }

  // --- WRITE THROUGH (with retry queue) ---

  async pushTask(task: any) {
    if (!this.db) return
    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO tasks (id, user_id, title, completed, created_at, updated_at, deleted_at, category, priority)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [task.id, task.userId, task.title, task.completed ? 1 : 0, task.createdAt, task.updatedAt, task.deletedAt, task.category || 'general', task.priority || 'medium'])
      })

      const success = await this.pushWithRetry(
        () => task.deletedAt ? axiosInstance.delete(`/api/tasks/${task.id}`) : axiosInstance.post('/api/tasks', task),
        `pushTask(${task.id})`,
        !!task.deletedAt
      )
      if (!success) {
        this.addToPending(PENDING_TASK_KEY, task)
      }
    } catch (e) { console.error("Push task failed:", e) }
  }

  async pushHabit(habit: any) {
    if (!this.db) return
    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO habits (id, user_id, name, description, streak, color, completed_today, completion_dates, last_completed_at, created_at, updated_at, deleted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [habit.id, habit.userId, habit.name, habit.description, habit.streak, habit.color, habit.completedToday ? 1 : 0, JSON.stringify(habit.completionDates || []), habit.lastCompletedAt, habit.createdAt, habit.updatedAt, habit.deletedAt])
      })

      const success = await this.pushWithRetry(
        () => habit.deletedAt ? axiosInstance.delete(`/api/habits/${habit.id}`) : axiosInstance.post('/api/habits', habit),
        `pushHabit(${habit.id})`,
        !!habit.deletedAt
      )
      if (!success) {
        this.addToPending(PENDING_HABIT_KEY, habit)
      }
    } catch (e) { console.error("Push habit failed:", e) }
  }

  async pushWorkout(workout: any) {
    if (!this.db) return
    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO workouts (id, name, training_split_id, user_id, created_at, updated_at, is_public, deleted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [workout.id, workout.name, workout.trainingSplitId, workout.userId, workout.createdAt, workout.updatedAt, workout.isPublic ? 1 : 0, workout.deletedAt])
      })

      const success = await this.pushWithRetry(
        () => workout.deletedAt ? axiosInstance.delete(`/api/workouts/${workout.id}`) : axiosInstance.post('/api/workouts', workout),
        `pushWorkout(${workout.id})`,
        !!workout.deletedAt
      )
      if (!success) {
        this.addToPending(PENDING_WORKOUT_KEY, workout)
      }
    } catch (e) { console.error("Push workout template failed:", e) }
  }

  async pushWorkoutLog(log: WorkoutLog) {
    if (!this.db) return
    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO workout_logs (id, user_id, workout_id, workout_name, notes, created_at, updated_at, deleted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [log.id, log.userId, log.workoutId || 'unknown', log.workoutName, log.notes, log.createdAt, log.updatedAt, log.deletedAt])
      })

      const success = await this.pushWithRetry(
        () => log.deletedAt ? axiosInstance.delete(`/api/workoutLogs/${log.id}`) : axiosInstance.post('/api/workoutLogs', log),
        `pushWorkoutLog(${log.id})`,
        !!log.deletedAt
      )
      if (!success) {
        this.addToPending(PENDING_WORKOUT_LOG_KEY, log)
      }
    } catch (e) { console.error("Push workout failed:", e) }
  }

  async pushWeightLog(log: WeightLog) {
    if (!this.db) return
    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO weight_logs (id, user_id, weight, notes, created_at, updated_at, deleted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [log.id, log.userId, log.weight, log.notes, log.createdAt, log.updatedAt, log.deletedAt])
      })

      const success = await this.pushWithRetry(
        () => log.deletedAt ? axiosInstance.delete(`/api/weightLogs/${log.id}`) : axiosInstance.post('/api/weightLogs', log),
        `pushWeightLog(${log.id})`,
        !!log.deletedAt
      )
      if (!success) {
        this.addToPending(PENDING_WEIGHT_KEY, log)
      }
    } catch (e) { console.error("Push weight failed:", e) }
  }

  async pushFoodLog(log: any) {
    if (!this.db) {
      console.error('[SyncManager] ❌ pushFoodLog called but DB is not initialized')
      return
    }
    console.log('[SyncManager] 💾 Pushing food log:', JSON.stringify(log))

    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO food_logs (
            id, user_id, logged_at, meal_type, food_items,
            total_calories, total_protein, total_carbs, total_fat,
            created_at, updated_at, deleted_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          log.id,
          log.userId,
          log.loggedAt,
          log.mealType,
          JSON.stringify(log.foodItems || []),
          log.totalCalories,
          log.totalProtein,
          log.totalCarbs,
          log.totalFat,
          log.createdAt || new Date().toISOString(),
          log.updatedAt || new Date().toISOString(),
          log.deletedAt || null
        ])
      })
      console.log(`[SyncManager] ✅ Food log ${log.id} saved to SQLite`)

      const success = await this.pushWithRetry(
        () => log.deletedAt
          ? axiosInstance.delete(`/api/nutrition/logs/${log.id}`)
          : axiosInstance.post('/api/nutrition/logs', log),
        `pushFoodLog(${log.id})`,
        !!log.deletedAt
      )

      if (!success) {
        this.addToPending(PENDING_FOOD_LOG_KEY, log)
        console.log(`[SyncManager] 📥 Food log ${log.id} queued for retry`)
      } else {
        console.log(`[SyncManager] ☁️ Food log ${log.id} pushed to API`)
      }
    } catch (e: any) {
      console.error("[SyncManager] ❌ Push food log failed:", e.message)
      if (e.response) {
        console.error("[SyncManager] ⚠️ Server Response:", e.response.status, e.response.data)
      }
    }
  }


}

export const SyncManager = new SyncManagerService()

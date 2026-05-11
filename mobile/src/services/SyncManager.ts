import * as SQLite from "expo-sqlite"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useWeightStore } from "@/src/stores/useWeightStore"
import { WeightLog } from "../types/weightType"
import { Workout, WorkoutLog } from "../types/workoutType"
import { ElectricSync } from "@/src/db/client"
import axiosInstance from '@/src/lib/api/axiosInstance'

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

      this.isInitialized = true
      await this.pullFromDB()

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

  // --- WRITE THROUGH ---

  async pushTask(task: any) {
    if (!this.db) return
    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO tasks (id, user_id, title, completed, created_at, updated_at, deleted_at, category, priority)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [task.id, task.userId, task.title, task.completed ? 1 : 0, task.createdAt, task.updatedAt, task.deletedAt, task.category || 'general', task.priority || 'medium'])
      })

      if (task.deletedAt) {
        await axiosInstance.delete(`/api/tasks/${task.id}`)
      } else {
        await axiosInstance.post('/api/tasks', task)
      }
    } catch (e) { console.error("Push task failed:", e) }
  }

  async pushHabit(habit: any) {
    if (!this.db) return
    try {
      await this.runExclusive(async () => {
        await this.db!.runAsync(`
          INSERT OR REPLACE INTO habits (id, user_id, name, description, streak, color, completed_today, last_completed_at, created_at, updated_at, deleted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [habit.id, habit.userId, habit.name, habit.description, habit.streak, habit.color, habit.completedToday ? 1 : 0, habit.lastCompletedAt, habit.createdAt, habit.updatedAt, habit.deletedAt])
      })

      if (habit.deletedAt) {
        await axiosInstance.delete(`/api/habits/${habit.id}`)
      } else {
        await axiosInstance.post('/api/habits', habit)
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

      if (workout.deletedAt) {
        await axiosInstance.delete(`/api/workouts/${workout.id}`)
      } else {
        await axiosInstance.post('/api/workouts', workout)
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

      if (log.deletedAt) {
        await axiosInstance.delete(`/api/workoutLogs/${log.id}`)
      } else {
        await axiosInstance.post('/api/workoutLogs', log)
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

      if (log.deletedAt) {
        await axiosInstance.delete(`/api/weightLogs/${log.id}`)
      } else {
        await axiosInstance.post('/api/weightLogs', log)
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

      // If deleted, use DELETE endpoint. Otherwise use POST (Create/Update)
      if (log.deletedAt) {
        await axiosInstance.delete(`/api/nutrition/logs/${log.id}`)
        console.log(`[SyncManager] 🗑️ Food log ${log.id} deleted from API`)
      } else {
        await axiosInstance.post('/api/nutrition/logs', log)
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

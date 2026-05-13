import { TauriSQLiteAdapter, db as adapterInstance } from "@/db/client"
import { useTasksStore } from "@/stores/useTasksStore"
import { useHabitsStore } from "@/stores/useHabitsStore"
import { useWorkoutsStore, WorkoutLog } from "@/stores/useWorkoutsStore"
import { useWeightStore, WeightLog } from "@/stores/useWeightStore"
import axiosInstance from '../../lib/api/axiosInstance'

class SyncManagerService {
  private db: TauriSQLiteAdapter | null = null
  private dbName = "self_tracker_v1.db"
  private isInitialized = false

  async initialize() {
    if (this.db) return

    try {
      console.log(`[SyncManager] Initializing Local DB: ${this.dbName}`)
      this.db = adapterInstance
      await this.db.init()

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
      `)

      this.isInitialized = true
      console.log("[SyncManager] Local DB ready")

    } catch (e: any) {
      console.error("[SyncManager] Initialization failed:", e)
      throw new Error(`DB Init Failed: ${e.message || String(e)}`)
    }
  }

  async startSync() {
    if (!this.db || !this.isInitialized) {
      console.log("[SyncManager] Cannot start sync: DB not initialized")
      return
    }

    // Try to fetch from REST API first (when online)
    // Falls back to local SQLite cache (offline-first)
    const token = localStorage.getItem("bearer_token")
    if (token) {
      const fetched = await this.fetchFromAPI()
      if (fetched) {
        console.log("[SyncManager] Data loaded from API, writing to SQLite...")
        await this.pushAllToSQLite()
      }
    }

    // Load whatever is in SQLite into Zustand stores
    await this.pullFromDB()
  }

  private async fetchFromAPI(): Promise<boolean> {
    const token = localStorage.getItem("bearer_token")
    if (!token) return false

    let anySuccess = false
    console.log("[SyncManager] Fetching data from REST API...")

    // Tasks
    try {
      const res = await axiosInstance.get("/api/tasks")
      const data = res.data
      const tasks = Array.isArray(data) ? data : (data.tasks || data.data || [])
      if (tasks.length > 0) {
        this._cachedTasks = tasks.map((t: any) => ({
          id: t.id,
          userId: t.userId || t.user_id || token,
          title: t.title,
          completed: !!t.completed,
          category: t.category || 'general',
          createdAt: t.createdAt || t.created_at || new Date().toISOString(),
          updatedAt: t.updatedAt || t.updated_at || new Date().toISOString(),
          deletedAt: t.deletedAt || t.deleted_at || null,
          dueDate: t.dueDate || t.due_date || null,
          description: t.description || null,
          projectId: t.projectId || t.project_id || null,
          columnId: t.columnId || t.column_id || null,
          priority: t.priority || 'medium',
          order: t.order || 0,
          completedAt: t.completedAt || t.completed_at || null,
        }))
        anySuccess = true
      }
    } catch (e: any) {
      if (e.response?.status !== 404) console.warn("[SyncManager] API tasks failed:", e.message)
    }

    // Habits
    try {
      const res = await axiosInstance.get("/api/habits")
      const data = res.data
      const habits = data.habits || data.data || (Array.isArray(data) ? data : [])
      if (habits.length > 0) {
        this._cachedHabits = habits.map((h: any) => ({
          id: h.id,
          userId: h.userId || h.user_id || token,
          name: h.name,
          description: h.description || null,
          color: h.color || '#10B981',
          streak: h.streak || 0,
          completedToday: !!h.completedToday || !!h.completed_today,
          lastCompletedAt: h.lastCompletedAt || h.last_completed_at || null,
          createdAt: h.createdAt || h.created_at || new Date().toISOString(),
          updatedAt: h.updatedAt || h.updated_at || new Date().toISOString(),
          deletedAt: h.deletedAt || h.deleted_at || null,
        }))
        anySuccess = true
      }
    } catch (e: any) {
      if (e.response?.status !== 404) console.warn("[SyncManager] API habits failed:", e.message)
    }

    // Weights
    try {
      const res = await axiosInstance.get("/api/weightLogs?limit=500")
      const data = res.data
      const logs = data.logs || data.data || (Array.isArray(data) ? data : [])
      if (logs.length > 0) {
        this._cachedWeights = logs.map((w: any) => ({
          id: w.id,
          userId: w.userId || w.user_id || token,
          weight: w.weight,
          notes: w.notes || null,
          mood: w.mood || null,
          energy: w.energy || null,
          createdAt: w.createdAt || w.created_at || new Date().toISOString(),
          updatedAt: w.updatedAt || w.updated_at || new Date().toISOString(),
          deletedAt: w.deletedAt || w.deleted_at || null,
        }))
        anySuccess = true
      }
    } catch (e: any) {
      if (e.response?.status !== 404) console.warn("[SyncManager] API weights failed:", e.message)
    }

    // Workouts
    try {
      const res = await axiosInstance.get("/api/workoutLogs?limit=500")
      const data = res.data
      const logs = data.logs || data.data || (Array.isArray(data) ? data : [])
      if (logs.length > 0) {
        this._cachedWorkouts = logs.map((w: any) => ({
          id: w.id,
          userId: w.userId || w.user_id || token,
          workoutId: w.workoutId || w.workout_id || '',
          workoutName: w.workoutName || w.workout_name || 'Workout',
          notes: w.notes || null,
          createdAt: w.createdAt || w.created_at || new Date().toISOString(),
          updatedAt: w.updatedAt || w.updated_at || new Date().toISOString(),
          deletedAt: w.deletedAt || w.deleted_at || null,
        }))
        anySuccess = true
      }
    } catch (e: any) {
      if (e.response?.status !== 404) console.warn("[SyncManager] API workouts failed:", e.message)
    }

    return anySuccess
  }

  private _cachedTasks: any[] = []
  private _cachedHabits: any[] = []
  private _cachedWeights: any[] = []
  private _cachedWorkouts: any[] = []

  private async pushAllToSQLite() {
    if (!this.db) return

    for (const t of this._cachedTasks) {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO tasks (id, user_id, title, completed, created_at, updated_at, deleted_at, category, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [t.id, t.userId, t.title, t.completed ? 1 : 0, t.createdAt, t.updatedAt, t.deletedAt, t.category || 'general', t.priority || 'medium'])
    }
    for (const h of this._cachedHabits) {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO habits (id, user_id, name, description, streak, color, completed_today, last_completed_at, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [h.id, h.userId, h.name, h.description, h.streak, h.color, h.completedToday ? 1 : 0, h.lastCompletedAt, h.createdAt, h.updatedAt, h.deletedAt])
    }
    for (const w of this._cachedWeights) {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO weight_logs (id, user_id, weight, notes, created_at, updated_at, deleted_at, energy, mood)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [w.id, w.userId, w.weight, w.notes, w.createdAt, w.updatedAt, w.deletedAt, w.energy || null, w.mood || null])
    }
    for (const w of this._cachedWorkouts) {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO workout_logs (id, user_id, workout_id, workout_name, notes, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [w.id, w.userId, w.workoutId, w.workoutName, w.notes, w.createdAt, w.updatedAt, w.deletedAt])
    }
    console.log("[SyncManager] SQLite populated with API data")
  }

  async pullFromDB() {
    if (!this.db) return

    try {
      // Tasks
      const tasksResult = await this.db.getAllAsync('SELECT * FROM tasks WHERE deleted_at IS NULL') as any[]
      if (tasksResult.length > 0) {
        useTasksStore.getState().setTasks(tasksResult.map(t => ({
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
        })))
      }

      // Habits
      const habitsResult = await this.db.getAllAsync('SELECT * FROM habits WHERE deleted_at IS NULL') as any[]
      if (habitsResult.length > 0) {
        useHabitsStore.getState().setHabits(habitsResult.map(h => ({
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
        })))
      }

      // Workout templates
      const workoutsResult = await this.db.getAllAsync('SELECT * FROM workouts WHERE deleted_at IS NULL') as any[]
      if (workoutsResult.length > 0) {
        useWorkoutsStore.getState().setWorkouts(workoutsResult.map(w => ({
          id: w.id,
          name: w.name,
          trainingSplitId: w.training_split_id,
          userId: w.user_id,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          isPublic: !!w.is_public,
          deletedAt: w.deleted_at
        })))
      }

      // Workout logs
      const workoutLogsResult = await this.db.getAllAsync('SELECT * FROM workout_logs WHERE deleted_at IS NULL') as any[]
      if (workoutLogsResult.length > 0) {
        useWorkoutsStore.getState().setWorkoutLogs(workoutLogsResult.map(w => ({
          id: w.id,
          userId: w.user_id,
          workoutId: w.workout_id,
          workoutName: w.workout_name,
          notes: w.notes,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          deletedAt: w.deleted_at
        })))
      }

      // Weights
      const weightsResult = await this.db.getAllAsync('SELECT * FROM weight_logs WHERE deleted_at IS NULL') as any[]
      if (weightsResult.length > 0) {
        useWeightStore.getState().setWeightLogs(weightsResult.map(w => ({
          id: w.id,
          userId: w.user_id,
          weight: w.weight,
          notes: w.notes,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          deletedAt: w.deleted_at
        })))
      }

      console.log("[SyncManager] Pulled from local SQLite")
    } catch (e) {
      console.error("[SyncManager] pullFromDB failed:", e)
    }
  }

  // --- WRITE THROUGH (local SQLite + REST API) ---

  async pushTask(task: any) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO tasks (id, user_id, title, completed, created_at, updated_at, deleted_at, category, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [task.id, task.userId, task.title, task.completed ? 1 : 0, task.createdAt, task.updatedAt, task.deletedAt, task.category || 'general', task.priority || 'medium'])
      const token = localStorage.getItem("bearer_token")
      if (token) await axiosInstance.post('/api/tasks', task)
    } catch (e) { console.warn("[SyncManager] pushTask:", e) }
  }

  async pushHabit(habit: any) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO habits (id, user_id, name, description, streak, color, completed_today, last_completed_at, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [habit.id, habit.userId, habit.name, habit.description, habit.streak, habit.color, habit.completedToday ? 1 : 0, habit.lastCompletedAt, habit.createdAt, habit.updatedAt, habit.deletedAt])
      const token = localStorage.getItem("bearer_token")
      if (token) await axiosInstance.post('/api/habits', habit)
    } catch (e) { console.warn("[SyncManager] pushHabit:", e) }
  }

  async pushWeightLog(log: WeightLog) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO weight_logs (id, user_id, weight, notes, created_at, updated_at, deleted_at, energy, mood)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [log.id, log.userId, log.weight, log.notes, log.createdAt, log.updatedAt, log.deletedAt, log.energy || null, log.mood || null])
      const token = localStorage.getItem("bearer_token")
      if (token) await axiosInstance.post('/api/weightLogs', log)
    } catch (e) { console.warn("[SyncManager] pushWeightLog:", e) }
  }

  async pushWorkoutLog(log: WorkoutLog) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO workout_logs (id, user_id, workout_id, workout_name, notes, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [log.id, log.userId, log.workoutId || 'unknown', log.workoutName, log.notes, log.createdAt, log.updatedAt, log.deletedAt])
      const token = localStorage.getItem("bearer_token")
      if (token) await axiosInstance.post('/api/workoutLogs', log)
    } catch (e) { console.warn("[SyncManager] pushWorkoutLog:", e) }
  }
}

export const SyncManager = new SyncManagerService()

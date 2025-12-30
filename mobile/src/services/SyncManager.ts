import * as SQLite from "expo-sqlite"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { useWorkoutsStore, WorkoutLog, Workout } from "@/src/stores/useWorkoutsStore"
import { useWeightStore, WeightLog } from "@/src/stores/useWeightStore"
import { ElectricSync } from "@/src/db/client"
import axiosInstance from '@/src/lib/api/axiosInstance'

class SyncManagerService {
  private db: SQLite.SQLiteDatabase | null = null
  private dbName = "self_tracker_db_v4.db"
  private isInitialized = false

  async initialize() {
    if (this.db) return

    try {
      console.log(`[SyncManager] Initializing Local DB: ${this.dbName}`)
      this.db = await SQLite.openDatabaseAsync(this.dbName)

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
      // Load whatever local data we have immediately
      await this.pullFromDB()

    } catch (e) {
      console.error("[SyncManager] Initialization failed:", e)
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
      this.pullFromDB()
    })
    this.currentSync = electric

    // Start syncs (non-blocking) - ElectricSync will now pick up the token internally
    electric.syncTable('tasks')
    electric.syncTable('habits')
    electric.syncTable('workouts')
    electric.syncTable('workout_logs')
    electric.syncTable('weight_logs')
  }

  async pullFromDB() {
    if (!this.db) return

    try {
      // --- TASKS ---
      const tasksResult = await this.db.getAllAsync('SELECT * FROM tasks WHERE deleted_at IS NULL') as any[]
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
      if (tasks.length > 0 || true) useTasksStore.getState().setTasks(tasks)

      // --- HABITS ---
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
      if (habits.length > 0) useHabitsStore.getState().setHabits(habits)

      // --- WORKOUTS (Templates) ---
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
      if (workouts.length > 0) useWorkoutsStore.getState().setWorkouts(workouts)


      // --- WORKOUT LOGS ---
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
      if (workoutLogs.length > 0 || true) useWorkoutsStore.getState().setWorkoutLogs(workoutLogs)

      // --- WEIGHTS ---
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
      if (weightLogs.length > 0) useWeightStore.getState().setWeightLogs(weightLogs)

    } catch (e) {
      console.error("[SyncManager] Pull failed:", e)
    }
  }

  // --- WRITE THROUGH ---

  async pushTask(task: any) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO tasks (id, user_id, title, completed, created_at, updated_at, deleted_at, category, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [task.id, task.userId, task.title, task.completed ? 1 : 0, task.createdAt, task.updatedAt, task.deletedAt, task.category || 'general', task.priority || 'medium'])

      await axiosInstance.post('/api/tasks', task)

    } catch (e) { console.error("Push task failed:", e) }
  }

  async pushHabit(habit: any) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO habits (id, user_id, name, description, streak, color, completed_today, last_completed_at, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [habit.id, habit.userId, habit.name, habit.description, habit.streak, habit.color, habit.completedToday ? 1 : 0, habit.lastCompletedAt, habit.createdAt, habit.updatedAt, habit.deletedAt])

      await axiosInstance.post('/api/habits', habit)

    } catch (e) { console.error("Push habit failed:", e) }
  }

  async pushWorkout(workout: any) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
         INSERT OR REPLACE INTO workouts (id, name, training_split_id, user_id, created_at, updated_at, is_public, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       `, [workout.id, workout.name, workout.trainingSplitId, workout.userId, workout.createdAt, workout.updatedAt, workout.isPublic ? 1 : 0, workout.deletedAt])

      await axiosInstance.post('/api/workouts', workout)

    } catch (e) { console.error("Push workout template failed:", e) }
  }

  async pushWorkoutLog(log: WorkoutLog) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO workout_logs (id, user_id, workout_id, workout_name, notes, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [log.id, log.userId, log.workoutId || 'unknown', log.workoutName, log.notes, log.createdAt, log.updatedAt, log.deletedAt])

      await axiosInstance.post('/api/workoutLogs', log)

    } catch (e) { console.error("Push workout failed:", e) }
  }

  async pushWeightLog(log: WeightLog) {
    if (!this.db) return
    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO weight_logs (id, user_id, weight, notes, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [log.id, log.userId, log.weight, log.notes, log.createdAt, log.updatedAt, log.deletedAt])

      await axiosInstance.post('/api/weightLogs', log)

    } catch (e) { console.error("Push weight failed:", e) }
  }


}


export const SyncManager = new SyncManagerService()

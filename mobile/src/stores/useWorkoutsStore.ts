import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'
import { WorkoutLog, Workout } from '../types/workoutType'
import { getPowerSyncDB } from '@/src/db/powerSyncClient'

const STORAGE_KEY_LOGS = 'local-workout-logs'
const STORAGE_KEY_TEMPLATES = 'local-workouts'

const loadWorkoutLogs = (): WorkoutLog[] => {
  return mmkvStorage.getItem<WorkoutLog[]>(STORAGE_KEY_LOGS) ?? []
}

const loadWorkouts = (): Workout[] => {
  return mmkvStorage.getItem<Workout[]>(STORAGE_KEY_TEMPLATES) ?? []
}

const saveWorkoutLogs = (logs: WorkoutLog[]) => {
  mmkvStorage.setItem(STORAGE_KEY_LOGS, logs)
}

const saveWorkouts = (workouts: Workout[]) => {
  mmkvStorage.setItem(STORAGE_KEY_TEMPLATES, workouts)
}

type WorkoutsState = {
  workoutLogs: WorkoutLog[]
  workouts: Workout[]
  nextCursor: string | null
  isLoading: boolean
  hasMore: boolean
  setWorkoutLogs: (logs: WorkoutLog[]) => void
  setWorkouts: (workouts: Workout[]) => void
  addWorkoutLog: (log: Omit<WorkoutLog, 'id' | 'updatedAt' | 'deletedAt'> & { createdAt?: string }) => void
  updateWorkoutLog: (id: string, updates: Partial<WorkoutLog>) => void
  addWorkout: (workout: Omit<Workout, 'id' | 'updatedAt' | 'deletedAt'> & { createdAt?: string }) => void
  deleteWorkoutLog: (id: string) => void
  fetchWorkoutLogs: (cursor?: string) => Promise<void>
  appendWorkoutLogs: (logs: WorkoutLog[], cursor: string | null) => void
  resetPagination: () => void
}

export const useWorkoutsStore = create<WorkoutsState>((set, get) => ({
  workoutLogs: loadWorkoutLogs(),
  workouts: loadWorkouts(),
  nextCursor: null,
  isLoading: false,
  hasMore: true,

  setWorkoutLogs: (logs) => {
    const uniqueLogs = Array.from(new Map(logs.map(l => [l.id, l])).values())
    if (uniqueLogs.length !== logs.length) {
      console.warn('[useWorkoutsStore] Detected duplicates in setWorkoutLogs! Filtering...', logs.length - uniqueLogs.length)
    }
    saveWorkoutLogs(uniqueLogs)
    set({ workoutLogs: uniqueLogs })
  },

  setWorkouts: (workouts) => {
    saveWorkouts(workouts)
    set({ workouts })
  },

  addWorkout: (workoutData) => {
    const workout: Workout = {
      ...workoutData,
      id: crypto.randomUUID(),
      createdAt: workoutData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }
    const newWorkouts = [workout, ...get().workouts]
    saveWorkouts(newWorkouts)
    set({ workouts: newWorkouts })

    try {
      getPowerSyncDB().then(db => {
        db.execute(
          'INSERT OR REPLACE INTO workouts (id, name, training_split_id, user_id, created_at, updated_at, is_public, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [workout.id, workout.name, workout.trainingSplitId, workout.userId, workout.createdAt, workout.updatedAt, workout.isPublic ? 1 : 0, workout.deletedAt]
        )
      })
    } catch (e) {
      console.error('Failed to write workout to PowerSync:', e)
    }
  },

  updateWorkoutLog: (id, updates) => {
    let updatedLog: WorkoutLog | null = null
    const newLogs = get().workoutLogs.map((l) => {
      if (l.id === id) {
        updatedLog = { ...l, ...updates, updatedAt: new Date().toISOString() }
        return updatedLog
      }
      return l
    })
    saveWorkoutLogs(newLogs)
    set({ workoutLogs: newLogs })

    if (updatedLog) {
      try {
        getPowerSyncDB().then(db => {
          db.execute(
            'UPDATE workout_logs SET workout_id = ?, workout_name = ?, notes = ?, updated_at = ?, deleted_at = ? WHERE id = ?',
            [updatedLog.workoutId, updatedLog.workoutName, updatedLog.notes, updatedLog.updatedAt, updatedLog.deletedAt, updatedLog.id]
          )
        })
      } catch (e) {
        console.error('Failed to update workout log in PowerSync:', e)
      }
    }
  },

  addWorkoutLog: (logData) => {
    const log: WorkoutLog = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: logData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }
    const newLogs = [log, ...get().workoutLogs]
    saveWorkoutLogs(newLogs)
    set({ workoutLogs: newLogs })

    try {
      getPowerSyncDB().then(db => {
        db.execute(
          'INSERT OR REPLACE INTO workout_logs (id, user_id, workout_id, workout_name, notes, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [log.id, log.userId, log.workoutId || 'unknown', log.workoutName, log.notes, log.createdAt, log.updatedAt, log.deletedAt]
        )
      })
    } catch (e) {
      console.error('Failed to write workout log to PowerSync:', e)
    }
  },

  deleteWorkoutLog: (id) => {
    let deletedLog: WorkoutLog | null = null
    const newLogs = get().workoutLogs.map((l) => {
      if (l.id === id) {
        deletedLog = { ...l, deletedAt: new Date().toISOString() }
        return deletedLog
      }
      return l
    })
    saveWorkoutLogs(newLogs)
    set({ workoutLogs: newLogs })

    if (deletedLog) {
      try {
        getPowerSyncDB().then(db => {
          db.execute('DELETE FROM workout_logs WHERE id = ?', [deletedLog.id])
        })
      } catch (e) {
        console.error('Failed to delete workout log from PowerSync:', e)
      }
    }
  },

  fetchWorkoutLogs: async (cursor?: string) => {
    if (get().isLoading) return
    set({ isLoading: true })

    try {
      const { getWorkoutLogs } = await import('@/src/lib/api/workoutLogsApi')
      const response = await getWorkoutLogs(cursor, 20)

      if (cursor) {
        get().appendWorkoutLogs(response.logs, response.nextCursor)
      } else {
        const existingLogs = get().workoutLogs
        const newLogs = response.logs.filter(
          (newLog) => !existingLogs.some((existing) => existing.id === newLog.id)
        )
        const merged = [...existingLogs, ...newLogs]
        const uniqueLogs = Array.from(new Map(merged.map(l => [l.id, l])).values())
        saveWorkoutLogs(uniqueLogs)
        set({
          workoutLogs: uniqueLogs,
          nextCursor: response.nextCursor,
          hasMore: response.nextCursor !== null,
        })
      }
    } catch (e) {
      console.error('Failed to fetch workout logs:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  appendWorkoutLogs: (logs, cursor) => {
    const existingLogs = get().workoutLogs
    const newLogs = logs.filter(
      (newLog) => !existingLogs.some((existing) => existing.id === newLog.id)
    )
    const merged = [...existingLogs, ...newLogs]
    saveWorkoutLogs(merged)
    set({
      workoutLogs: merged,
      nextCursor: cursor,
      hasMore: cursor !== null,
    })
  },

  resetPagination: () => {
    set({ nextCursor: null, hasMore: true })
  },
}))

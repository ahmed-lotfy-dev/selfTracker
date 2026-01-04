import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'

export type WorkoutLog = {
  id: string
  userId: string
  workoutId?: string | null
  workoutName: string
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type Workout = {
  id: string
  name: string
  trainingSplitId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  isPublic: boolean | null
  deletedAt: string | null
}

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
      const { SyncManager } = require('@/src/services/SyncManager')
      SyncManager.pushWorkout(workout)
    } catch (e) {
      console.error('Failed to sync new workout:', e)
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
        const { SyncManager } = require('@/src/services/SyncManager')
        SyncManager.pushWorkoutLog(updatedLog)
      } catch (e) {
        console.error('Failed to sync updated workout log:', e)
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
      const { SyncManager } = require('@/src/services/SyncManager')
      SyncManager.pushWorkoutLog(log)
    } catch (e) {
      console.error('Failed to sync workout log:', e)
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
        const { SyncManager } = require('@/src/services/SyncManager')
        SyncManager.pushWorkoutLog(deletedLog)
      } catch (e) {
        console.error('Failed to sync deleted workout log:', e)
      }
    }
  },

  fetchWorkoutLogs: async (cursor?: string) => {
    if (get().isLoading) return
    set({ isLoading: true })

    try {
      const { getWorkoutLogs } = await import('@/src/lib/api/workoutLogsApi')
      console.log('[WorkoutsStore] Fetching workout logs, cursor:', cursor)
      const response = await getWorkoutLogs(cursor, 20)
      console.log('[WorkoutsStore] API response:', response.logs.length, 'logs, nextCursor:', response.nextCursor)

      if (cursor) {
        get().appendWorkoutLogs(response.logs, response.nextCursor)
      } else {
        const existingLogs = get().workoutLogs
        console.log('[WorkoutsStore] Existing logs:', existingLogs.length)
        const newLogs = response.logs.filter(
          (newLog) => !existingLogs.some((existing) => existing.id === newLog.id)
        )
        console.log('[WorkoutsStore] New logs to add:', newLogs.length)
        const merged = [...existingLogs, ...newLogs]
        const uniqueLogs = Array.from(new Map(merged.map(l => [l.id, l])).values())
        console.log('[WorkoutsStore] Total unique logs after merge:', uniqueLogs.length)
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

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '@/src/lib/storage/mmkv'

export type WorkoutLog = {
  id: string
  userId: string
  workoutId: string | null
  workoutName: string
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

type WorkoutLogsState = {
  logs: WorkoutLog[]
  isLoaded: boolean
  setLogs: (logs: WorkoutLog[]) => void
  addLog: (log: WorkoutLog) => void
  updateLog: (id: string, updates: Partial<WorkoutLog>) => void
  deleteLog: (id: string) => void
}

export const useWorkoutLogsStore = create<WorkoutLogsState>()(
  persist(
    (set) => ({
      logs: [],
      isLoaded: false,

      setLogs: (logs) => set({ logs, isLoaded: true }),

      addLog: (log) => set((state) => ({
        logs: [log, ...state.logs]
      })),

      updateLog: (id, updates) => set((state) => ({
        logs: state.logs.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        )
      })),

      deleteLog: (id) => set((state) => ({
        logs: state.logs.map((l) =>
          l.id === id ? { ...l, deletedAt: new Date().toISOString() } : l
        )
      })),
    }),
    {
      name: 'workout-logs-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true
        }
      },
    }
  )
)

export const useActiveWorkoutLogs = () => useWorkoutLogsStore((state) =>
  state.logs.filter((l) => !l.deletedAt)
)

export const useSortedWorkoutLogs = () => useWorkoutLogsStore((state) =>
  state.logs
    .filter((l) => !l.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

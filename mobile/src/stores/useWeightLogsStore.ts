import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '@/src/lib/storage/mmkv'

export type WeightLog = {
  id: string
  userId: string
  weight: string
  mood: string | null
  energy: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

type WeightLogsState = {
  logs: WeightLog[]
  isLoaded: boolean
  setLogs: (logs: WeightLog[]) => void
  addLog: (log: WeightLog) => void
  updateLog: (id: string, updates: Partial<WeightLog>) => void
  deleteLog: (id: string) => void
}

export const useWeightLogsStore = create<WeightLogsState>()(
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
      name: 'weight-logs-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true
        }
      },
    }
  )
)

export const useActiveWeightLogs = () => useWeightLogsStore((state) =>
  state.logs.filter((l) => !l.deletedAt)
)

export const useSortedWeightLogs = () => useWeightLogsStore((state) =>
  state.logs
    .filter((l) => !l.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

export const useLatestWeight = () => useWeightLogsStore((state) => {
  const sorted = state.logs
    .filter((l) => !l.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return sorted[0] ?? null
})

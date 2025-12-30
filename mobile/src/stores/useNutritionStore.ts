import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '@/src/lib/storage/mmkv'
import { SyncManager } from '@/src/services/SyncManager'
import type { FoodLog, NutritionGoals } from '@/src/types/nutrition'

type NutritionState = {
  foodLogs: FoodLog[]
  goals: NutritionGoals | null
  isLoaded: boolean
  setFoodLogs: (logs: FoodLog[]) => void
  addFoodLog: (log: FoodLog) => void
  updateFoodLog: (id: string, updates: Partial<FoodLog>) => void
  deleteFoodLog: (id: string) => void
  setGoals: (goals: NutritionGoals | null) => void
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set) => ({
      foodLogs: [],
      goals: null,
      isLoaded: false,

      setFoodLogs: (foodLogs) => set({ foodLogs, isLoaded: true }),

      addFoodLog: (log) => {
        set((state) => ({
          foodLogs: [log, ...state.foodLogs]
        }))
        SyncManager.pushFoodLog(log)
      },

      updateFoodLog: (id, updates) => {
        set((state) => {
          const updatedLogs = state.foodLogs.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
          )
          const updatedLog = updatedLogs.find(l => l.id === id)
          if (updatedLog) SyncManager.pushFoodLog(updatedLog)
          return { foodLogs: updatedLogs }
        })
      },

      deleteFoodLog: (id) => {
        set((state) => ({
          foodLogs: state.foodLogs.filter((l) => l.id !== id)
        }))
        SyncManager.deleteFoodLog(id)
      },

      setGoals: (goals) => set({ goals }),
    }),
    {
      name: 'nutrition-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true
        }
      },
    }
  )
)

export const getTodaysFoodLogs = (foodLogs: FoodLog[]): FoodLog[] => {
  const today = new Date().toDateString()
  return foodLogs.filter((l) => new Date(l.loggedAt).toDateString() === today)
}

export const getTodaysCalories = (foodLogs: FoodLog[]): number => {
  const today = new Date().toDateString()
  return foodLogs
    .filter((l) => new Date(l.loggedAt).toDateString() === today)
    .reduce((sum, l) => sum + l.totalCalories, 0)
}


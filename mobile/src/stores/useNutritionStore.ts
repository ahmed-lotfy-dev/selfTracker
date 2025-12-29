import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '@/src/lib/storage/mmkv'
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

      addFoodLog: (log) => set((state) => ({
        foodLogs: [log, ...state.foodLogs]
      })),

      updateFoodLog: (id, updates) => set((state) => ({
        foodLogs: state.foodLogs.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        )
      })),

      deleteFoodLog: (id) => set((state) => ({
        foodLogs: state.foodLogs.filter((l) => l.id !== id)
      })),

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


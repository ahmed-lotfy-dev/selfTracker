import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '@/src/lib/storage/mmkv'
import { createFoodLog, deleteFoodLog as deleteFoodLogApi, updateFoodLog as updateFoodLogApi } from '@/src/lib/api/nutritionApi'
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
        const apiData = {
          id: log.id,
          loggedAt: new Date(log.loggedAt),
          mealType: log.mealType,
          foodItems: log.foodItems,
          totalCalories: log.totalCalories,
          totalProtein: log.totalProtein ?? undefined,
          totalCarbs: log.totalCarbs ?? undefined,
          totalFat: log.totalFat ?? undefined
        }
        createFoodLog(apiData).catch(err => console.error('[Nutrition Store] Failed to create food log:', err))
      },

      updateFoodLog: (id, updates) => {
        set((state) => {
          const updatedLogs = state.foodLogs.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
          )
          const updatedLog = updatedLogs.find(l => l.id === id)
          if (updatedLog) {
            const apiUpdates: any = { ...updates }
            if (apiUpdates.loggedAt) {
              apiUpdates.loggedAt = new Date(apiUpdates.loggedAt)
            }
            updateFoodLogApi(id, apiUpdates).catch(err => console.error('[Nutrition Store] Failed to update food log:', err))
          }
          return { foodLogs: updatedLogs }
        })
      },

      deleteFoodLog: (id) => {
        set((state) => ({
          foodLogs: state.foodLogs.filter((l) => l.id !== id)
        }))
        deleteFoodLogApi(id).catch(err => console.error('[Nutrition Store] Failed to delete food log:', err))
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


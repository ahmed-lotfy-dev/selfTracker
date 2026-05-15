import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '@/src/lib/storage/mmkv'
import type { FoodLog, NutritionGoals } from '@/src/types/nutritionType'
import { getPowerSyncDB } from '@/src/db/powerSyncClient'

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
        // 1. Update MMKV immediately (instant UI)
        set((state) => ({
          foodLogs: [log, ...state.foodLogs]
        }))

        // 2. Write to PowerSync SQLite — syncs automatically
        try {
          getPowerSyncDB().then(db => {
            db.execute(
              'INSERT OR REPLACE INTO food_logs (id, user_id, logged_at, meal_type, food_items, total_calories, total_protein, total_carbs, total_fat, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                log.id,
                log.userId || 'unknown',
                log.loggedAt,
                log.mealType,
                JSON.stringify(log.foodItems || []),
                log.totalCalories,
                log.totalProtein,
                log.totalCarbs,
                log.totalFat,
                log.createdAt || new Date().toISOString(),
                log.updatedAt || new Date().toISOString(),
                log.deletedAt || null,
              ]
            )
          })
        } catch (e) {
          console.error('Failed to write food log to PowerSync:', e)
        }
      },

      updateFoodLog: (id, updates) => {
        set((state) => {
          const updatedLogs = state.foodLogs.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
          )
          const updatedLog = updatedLogs.find(l => l.id === id)
          if (updatedLog) {
            try {
              getPowerSyncDB().then(db => {
                db.execute(
                  'UPDATE food_logs SET logged_at = ?, meal_type = ?, food_items = ?, total_calories = ?, total_protein = ?, total_carbs = ?, total_fat = ?, updated_at = ?, deleted_at = ? WHERE id = ?',
                  [
                    updatedLog.loggedAt,
                    updatedLog.mealType,
                    JSON.stringify(updatedLog.foodItems || []),
                    updatedLog.totalCalories,
                    updatedLog.totalProtein,
                    updatedLog.totalCarbs,
                    updatedLog.totalFat,
                    updatedLog.updatedAt,
                    updatedLog.deletedAt,
                    updatedLog.id,
                  ]
                )
              })
            } catch (e) {
              console.error('Failed to update food log in PowerSync:', e)
            }
          }
          return { foodLogs: updatedLogs }
        })
      },

      deleteFoodLog: (id) => {
        set((state) => ({
          foodLogs: state.foodLogs.filter((l) => l.id !== id)
        }))

        try {
          getPowerSyncDB().then(db => {
            db.execute('DELETE FROM food_logs WHERE id = ?', [id])
          })
        } catch (e) {
          console.error('Failed to delete food log from PowerSync:', e)
        }
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

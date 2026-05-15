import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'
import { Habit } from '../types/habitType'
import { getHabits } from '@/src/lib/api/habitsApi'
import { getPowerSyncDB } from '@/src/db/powerSyncClient'

const STORAGE_KEY = 'local-habits'

const loadHabits = (): Habit[] => {
  return mmkvStorage.getItem<Habit[]>(STORAGE_KEY) ?? []
}

const saveHabits = (habits: Habit[]) => {
  mmkvStorage.setItem(STORAGE_KEY, habits)
}

type HabitsState = {
  habits: Habit[]
  isLoading: boolean
  setHabits: (habits: Habit[]) => void
  fetchHabits: () => Promise<void>
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'streak' | 'completedToday' | 'lastCompletedAt' | 'completionDates'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleComplete: (id: string) => void
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: loadHabits(),
  isLoading: false,

  setHabits: (habits) => {
    saveHabits(habits)
    set({ habits })
  },

  fetchHabits: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const serverHabits = await getHabits()
      const existingHabits = get().habits
      const newHabits = serverHabits.filter(
        (h) => !existingHabits.some((e) => e.id === h.id)
      )
      const merged = [...existingHabits, ...newHabits]
      const unique = Array.from(new Map(merged.map(h => [h.id, h])).values())
      saveHabits(unique)
      set({ habits: unique })
    } catch (e) {
      console.error('Failed to fetch habits:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  addHabit: (habitData) => {
    const habit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      streak: 0,
      completedToday: false,
      lastCompletedAt: null,
      completionDates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }
    const newHabits = [habit, ...get().habits]
    saveHabits(newHabits)
    set({ habits: newHabits })

    try {
      getPowerSyncDB().then(db => {
        db.execute(
          'INSERT OR REPLACE INTO habits (id, user_id, name, description, streak, color, completed_today, completion_dates, last_completed_at, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [habit.id, habit.userId, habit.name, habit.description, habit.streak, habit.color, habit.completedToday ? 1 : 0, JSON.stringify(habit.completionDates || []), habit.lastCompletedAt, habit.createdAt, habit.updatedAt, habit.deletedAt]
        )
      })
    } catch (e) {
      console.error('Failed to write habit to PowerSync:', e)
    }
  },

  updateHabit: (id, updates) => {
    let updatedHabit: Habit | null = null
    const newHabits = get().habits.map((h) => {
      if (h.id === id) {
        updatedHabit = { ...h, ...updates, updatedAt: new Date().toISOString() }
        return updatedHabit
      }
      return h
    })
    saveHabits(newHabits)
    set({ habits: newHabits })

    if (updatedHabit) {
      try {
        getPowerSyncDB().then(db => {
          db.execute(
            'UPDATE habits SET name = ?, description = ?, streak = ?, color = ?, completed_today = ?, completion_dates = ?, last_completed_at = ?, updated_at = ?, deleted_at = ? WHERE id = ?',
            [updatedHabit.name, updatedHabit.description, updatedHabit.streak, updatedHabit.color, updatedHabit.completedToday ? 1 : 0, JSON.stringify(updatedHabit.completionDates || []), updatedHabit.lastCompletedAt, updatedHabit.updatedAt, updatedHabit.deletedAt, updatedHabit.id]
          )
        })
      } catch (e) {
        console.error('Failed to update habit in PowerSync:', e)
      }
    }
  },

  deleteHabit: (id) => {
    let deletedHabit: Habit | null = null
    const newHabits = get().habits.map((h) => {
      if (h.id === id) {
        deletedHabit = { ...h, deletedAt: new Date().toISOString() }
        return deletedHabit
      }
      return h
    })
    saveHabits(newHabits)
    set({ habits: newHabits })

    if (deletedHabit) {
      try {
        getPowerSyncDB().then(db => {
          db.execute('DELETE FROM habits WHERE id = ?', [deletedHabit.id])
        })
      } catch (e) {
        console.error('Failed to delete habit from PowerSync:', e)
      }
    }
  },

  toggleComplete: (id) => {
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    let updatedHabit: Habit | null = null

    const newHabits = get().habits.map((h) => {
      if (h.id !== id) return h

      const dates = [...(h.completionDates || [])]
      const wasCompleted = dates.includes(today)
      let streak = h.streak ?? 0

      if (wasCompleted) {
        const idx = dates.indexOf(today)
        if (idx !== -1) dates.splice(idx, 1)
        streak = Math.max(0, streak - 1)
      } else {
        dates.push(today)
        dates.sort()
        streak = calculateStreak(dates)
      }

      updatedHabit = {
        ...h,
        completedToday: !wasCompleted,
        completionDates: dates,
        streak,
        lastCompletedAt: wasCompleted ? (dates.length > 0 ? dates[dates.length - 1] + 'T00:00:00.000Z' : null) : now,
        updatedAt: now,
      }
      return updatedHabit
    })
    saveHabits(newHabits)
    set({ habits: newHabits })

    if (updatedHabit) {
      try {
        getPowerSyncDB().then(db => {
          db.execute(
            'UPDATE habits SET completed_today = ?, completion_dates = ?, streak = ?, last_completed_at = ?, updated_at = ? WHERE id = ?',
            [updatedHabit.completedToday ? 1 : 0, JSON.stringify(updatedHabit.completionDates || []), updatedHabit.streak, updatedHabit.lastCompletedAt, updatedHabit.updatedAt, updatedHabit.id]
          )
        })
      } catch (e) {
        console.error('Failed to toggle habit in PowerSync:', e)
      }
    }
  },
}))

/** Calculate consecutive streak from an array of date strings (yyyy-MM-dd) */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort().reverse()
  let streak = 1
  const today = new Date().toISOString().split('T')[0]
  let expected = sorted[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  if (expected !== today && expected !== yesterdayStr) return 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(expected)
    prev.setDate(prev.getDate() - 1)
    const prevStr = prev.toISOString().split('T')[0]
    if (sorted[i] === prevStr) {
      streak++
      expected = prevStr
    } else {
      break
    }
  }
  return streak
}

export const useActiveHabits = () => {
  const habits = useHabitsStore((s) => s.habits)
  return habits.filter((h) => !h.deletedAt)
}

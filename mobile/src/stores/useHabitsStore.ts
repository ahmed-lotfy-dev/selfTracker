import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'

export type Habit = {
  id: string
  userId: string
  name: string
  description: string | null
  color: string
  streak: number
  completedToday: boolean
  lastCompletedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

const STORAGE_KEY = 'local-habits'

const loadHabits = (): Habit[] => {
  return mmkvStorage.getItem<Habit[]>(STORAGE_KEY) ?? []
}

const saveHabits = (habits: Habit[]) => {
  mmkvStorage.setItem(STORAGE_KEY, habits)
}

type HabitsState = {
  habits: Habit[]
  setHabits: (habits: Habit[]) => void
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'streak' | 'completedToday' | 'lastCompletedAt'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleComplete: (id: string) => void
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: loadHabits(),

  setHabits: (habits) => {
    saveHabits(habits)
    set({ habits })
  },

  addHabit: (habitData) => {
    const habit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      streak: 0,
      completedToday: false,
      lastCompletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }
    const newHabits = [habit, ...get().habits]
    saveHabits(newHabits)
    set({ habits: newHabits })

    try {
      const { SyncManager } = require('@/src/services/SyncManager')
      SyncManager.pushHabit(habit)
    } catch (e) {
      console.error('Failed to sync new habit:', e)
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
        const { SyncManager } = require('@/src/services/SyncManager')
        SyncManager.pushHabit(updatedHabit)
      } catch (e) {
        console.error('Failed to sync updated habit:', e)
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
        const { SyncManager } = require('@/src/services/SyncManager')
        SyncManager.pushHabit(deletedHabit)
      } catch (e) {
        console.error('Failed to sync deleted habit:', e)
      }
    }
  },

  toggleComplete: (id) => {
    const now = new Date().toISOString()
    let updatedHabit: Habit | null = null

    const newHabits = get().habits.map((h) => {
      if (h.id !== id) return h

      const wasCompleted = h.completedToday
      const lastDate = h.lastCompletedAt?.split('T')[0]
      let streak = h.streak
      let completedToday = h.completedToday

      if (wasCompleted) {
        completedToday = false
        streak = Math.max(0, h.streak - 1)
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        const continuesStreak = lastDate === yesterdayStr

        completedToday = true
        streak = continuesStreak ? h.streak + 1 : 1
      }

      updatedHabit = {
        ...h,
        completedToday,
        streak,
        lastCompletedAt: completedToday ? now : h.lastCompletedAt,
        updatedAt: now,
      }
      return updatedHabit
    })
    saveHabits(newHabits)
    set({ habits: newHabits })

    if (updatedHabit) {
      try {
        const { SyncManager } = require('@/src/services/SyncManager')
        SyncManager.pushHabit(updatedHabit)
      } catch (e) {
        console.error('Failed to sync habit completion:', e)
      }
    }
  },
}))

export const useActiveHabits = () => {
  const habits = useHabitsStore((s) => s.habits)
  return habits.filter((h) => !h.deletedAt)
}

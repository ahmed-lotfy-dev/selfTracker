import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'
import { Habit } from '../types/habitType'
import { getHabits } from '@/src/lib/api/habitsApi'
import { nowISO, todayLocal } from '@/src/lib/dateUtils'
import { getZero, type AppZero } from '@/src/zero/client'
import { toEpoch } from '@/src/zero/mappers'
import { mutators } from '@/src/zero/mutators'
import type { MutatorResult } from '@rocicorp/zero'

/**
 * Habits store — see `useTasksStore` for the read/write model.
 *
 * Reads come from Zero's materialized `habits` query (`src/zero/sync.ts`);
 * writes go through the `habit.insert|update|delete` custom mutators.
 * `completionDates` stays a `string[]` of `YYYY-MM-DD` values on both sides.
 */

const STORAGE_KEY = 'local-habits'

const loadHabits = (): Habit[] => {
  return mmkvStorage.getItem<Habit[]>(STORAGE_KEY) ?? []
}

const saveHabits = (habits: Habit[]) => {
  mmkvStorage.setItem(STORAGE_KEY, habits)
}

/** Fire-and-forget custom mutator; logs server-side rejections. */
function sendHabitMutation(label: string, run: (zero: AppZero) => MutatorResult) {
  const zero = getZero()
  if (!zero) {
    console.warn(`[habits] Zero not initialized — "${label}" is local-only`)
    return
  }
  try {
    void run(zero)
      .server.then((details: any) => {
        if (details?.type === 'error') {
          console.warn(`[habits] mutator "${label}" rejected:`, details.error)
        }
      })
      .catch((err: unknown) => {
        console.warn(`[habits] mutator "${label}" failed:`, err)
      })
  } catch (err) {
    console.warn(`[habits] mutator "${label}" threw:`, err)
  }
}

/** Maps a partial domain habit onto the mutator's partial args. */
function habitPatch(updates: Partial<Habit>) {
  const patch: Record<string, unknown> = {}
  if (updates.name !== undefined) patch.name = updates.name
  if (updates.description !== undefined) patch.description = updates.description
  if (updates.streak !== undefined) patch.streak = updates.streak
  if (updates.color !== undefined) patch.color = updates.color
  if (updates.completedToday !== undefined) patch.completedToday = updates.completedToday
  if (updates.completionDates !== undefined) patch.completionDates = updates.completionDates
  if (updates.lastCompletedAt !== undefined) patch.lastCompletedAt = toEpoch(updates.lastCompletedAt)
  return patch
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
    // Zero streams changes; REST is only the fallback when it is not running.
    if (getZero()) return
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
      createdAt: nowISO(),
      updatedAt: nowISO(),
      deletedAt: null,
    }
    const newHabits = [habit, ...get().habits]
    saveHabits(newHabits)
    set({ habits: newHabits })

    sendHabitMutation('habit.insert', (zero) =>
      zero.mutate(mutators.habit.insert({
        id: habit.id,
        userId: habit.userId || undefined,
        name: habit.name,
        description: habit.description,
        streak: habit.streak,
        color: habit.color,
        completedToday: habit.completedToday,
        completionDates: habit.completionDates,
        lastCompletedAt: toEpoch(habit.lastCompletedAt),
      }))
    )
  },

  updateHabit: (id, updates) => {
    const now = nowISO()
    let updatedHabit: Habit | null = null
    const newHabits = get().habits.map((h) => {
      if (h.id === id) {
        updatedHabit = { ...h, ...updates, updatedAt: now }
        return updatedHabit
      }
      return h
    })
    saveHabits(newHabits)
    set({ habits: newHabits })

    if (updatedHabit) {
      const patch = habitPatch(updates)
      if (Object.keys(patch).length === 0) return
      sendHabitMutation('habit.update', (zero) =>
        zero.mutate(mutators.habit.update({ id, ...patch }))
      )
    }
  },

  deleteHabit: (id) => {
    const now = nowISO()
    let deletedHabit: Habit | null = null
    const newHabits = get().habits.map((h) => {
      if (h.id === id) {
        deletedHabit = { ...h, deletedAt: now }
        return deletedHabit
      }
      return h
    })
    saveHabits(newHabits)
    set({ habits: newHabits })

    if (deletedHabit) {
      sendHabitMutation('habit.delete', (zero) => zero.mutate(mutators.habit.delete({ id })))
    }
  },

  toggleComplete: (id) => {
    const now = nowISO()
    const today = todayLocal()
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
      const habit = updatedHabit as Habit
      sendHabitMutation('habit.update', (zero) =>
        zero.mutate(mutators.habit.update({
          id,
          completedToday: habit.completedToday,
          completionDates: habit.completionDates,
          streak: habit.streak,
          lastCompletedAt: toEpoch(habit.lastCompletedAt),
        }))
      )
    }
  },
}))

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort().reverse()
  let streak = 1
  const today = todayLocal()
  let expected = sorted[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (expected !== today && expected !== yesterdayStr) return 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(expected)
    prev.setDate(prev.getDate() - 1)
    const prevStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`
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

import type { Task } from "@/src/stores/useTasksStore"
import type { Habit } from "@/src/types/habitType"
import { localDateToISO } from "@/src/lib/dateUtils"

/**
 * Wire ↔ domain mappers.
 *
 * Zero rows use epoch milliseconds for `timestamptz` columns; the rest of the
 * mobile app (components, MMKV cache, REST helpers) speaks ISO-8601 strings.
 * Keeping the conversion in one place means the stores never have to know how
 * the data is stored.
 */

type TaskRow = {
  id: string
  userId: string
  projectId?: string | null
  columnId?: string | null
  title: string
  description?: string | null
  completed?: boolean | null
  dueDate?: number | null
  priority?: "low" | "medium" | "high" | null
  order?: number | null
  category?: string | null
  createdAt?: number | null
  updatedAt?: number | null
  completedAt?: number | null
  deletedAt?: number | null
}

type HabitRow = {
  id: string
  userId: string
  name: string
  description?: string | null
  streak?: number | null
  color?: string | null
  completedToday?: boolean | null
  completionDates?: readonly string[] | null
  lastCompletedAt?: number | null
  createdAt?: number | null
  updatedAt?: number | null
  deletedAt?: number | null
}

export function fromEpoch(ms: number | null | undefined): string | null {
  return ms === null || ms === undefined ? null : new Date(ms).toISOString()
}

export function toEpoch(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime()
  return Number.isNaN(ms) ? null : ms
}

/**
 * Converts a timestamp or a date-only string (`YYYY-MM-DD`, e.g. `completedAt`
 * coming from `todayLocal()`) to epoch ms. Date-only values are anchored at
 * local noon so they don't shift a day across timezones.
 */
export function anyDateToEpoch(value: string | null | undefined): number | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(localDateToISO(value)).getTime()
  }
  return toEpoch(value)
}

export function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    completed: row.completed ?? false,
    category: row.category ?? "general",
    createdAt: fromEpoch(row.createdAt) ?? new Date().toISOString(),
    updatedAt: fromEpoch(row.updatedAt ?? row.createdAt) ?? new Date().toISOString(),
    deletedAt: fromEpoch(row.deletedAt),
    dueDate: fromEpoch(row.dueDate),
    description: row.description ?? null,
    projectId: row.projectId ?? null,
    columnId: row.columnId ?? null,
    priority: row.priority ?? "medium",
    order: row.order ?? 0,
    completedAt: fromEpoch(row.completedAt),
  }
}

export function mapHabitRow(row: HabitRow): Habit {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description ?? null,
    streak: row.streak ?? 0,
    color: row.color ?? "#6366f1",
    completedToday: row.completedToday ?? false,
    completionDates: [...(row.completionDates ?? [])],
    lastCompletedAt: fromEpoch(row.lastCompletedAt),
    createdAt: fromEpoch(row.createdAt) ?? new Date().toISOString(),
    updatedAt: fromEpoch(row.updatedAt ?? row.createdAt) ?? new Date().toISOString(),
    deletedAt: fromEpoch(row.deletedAt),
  }
}

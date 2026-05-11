export type Habit = {
  id: string
  userId: string
  name: string
  description: string | null
  color: string
  streak: number
  completedToday: boolean
  lastCompletedAt: string | null
  completionDates: string[]  // ISO date strings (e.g., "2026-05-12")
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

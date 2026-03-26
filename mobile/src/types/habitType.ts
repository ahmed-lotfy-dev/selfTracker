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

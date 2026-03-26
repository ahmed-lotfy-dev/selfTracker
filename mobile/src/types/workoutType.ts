export type WorkoutLog = {
  id: string
  userId: string
  workoutId?: string | null
  workoutName: string
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type Workout = {
  id: string
  name: string
  trainingSplitId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  isPublic: boolean | null
  deletedAt: string | null
}

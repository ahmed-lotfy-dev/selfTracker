import { z } from "zod"

export const WorkoutLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workoutId: z.string(),
  workoutName: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
})

export type WorkoutLogType = z.infer<typeof WorkoutLogSchema>

import { z } from "zod"

export const WorkoutLogSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  workoutId: z.string().min(1, "Please select a workout"),
  workoutName: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().min(1, "Date is required"),
})

export type WorkoutLogType = z.infer<typeof WorkoutLogSchema>

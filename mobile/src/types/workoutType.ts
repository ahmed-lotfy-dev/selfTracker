import { z } from "zod";

export const WorkoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workoutId: z.string(),
  workoutName: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export type WorkoutType = z.infer<typeof WorkoutSchema>;

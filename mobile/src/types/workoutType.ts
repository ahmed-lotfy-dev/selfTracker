import { z } from "zod"

export const WorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  trainingSplitId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type WorkoutType = z.infer<typeof WorkoutSchema>

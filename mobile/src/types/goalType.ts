import { z } from "zod"

export const GoalTypeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalType: z.enum(["loseWeight", "gainWeight", "bodyFat", "muscleMass"]),
  targetValue: z.number(),
  deadline: z.date().optional(),
  achieved: z.boolean(),
  createdAt: z.date(),
})

export type GoalType = z.infer<typeof GoalTypeSchema>

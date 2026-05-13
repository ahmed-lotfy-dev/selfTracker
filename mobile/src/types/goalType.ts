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

export type UserGoal = {
  id: string;
  userId: string;
  goalType: string;
  targetValue: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

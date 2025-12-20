import { z } from "zod"

export const WeightLogSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  weight: z.union([z.number(), z.string()]),
  mood: z.enum(["Low", "Medium", "High"], {
    errorMap: () => ({ message: "Mood must be Low, Medium, or High" }),
  }).nullable(),
  energy: z.enum(["Low", "Okay", "Good", "Great"], {
    errorMap: () => ({ message: "Energy must be Low, Okay, Good, or Great" }),
  }).nullable(),
  notes: z.string().nullable(),
  createdAt: z.any(),
})

export type WeightLogType = z.infer<typeof WeightLogSchema>

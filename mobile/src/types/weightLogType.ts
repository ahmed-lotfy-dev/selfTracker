import { z } from "zod"

export const WeightLogSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  weight: z.number(),
  mood: z.string(),
  energy: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
})

export type WeightLogType = z.infer<typeof WeightLogSchema>

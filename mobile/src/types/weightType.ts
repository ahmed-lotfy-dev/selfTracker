import { z } from "zod"

export const WeightSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  weight: z.number(),
  mood: z.string(),
  energy: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
})

export type WeightType = z.infer<typeof WeightSchema>;

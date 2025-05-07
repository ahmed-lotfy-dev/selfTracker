import { z } from "zod"

export const WeightLogSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  weight: z
    .number()
    .min(0.1, "Weight is needed")
    .refine((value) => value > 0, {
      message: "Weight must be a positive number",
    }),
  mood: z.enum(["Low", "Medium", "High"], {
    errorMap: () => ({ message: "Mood must be Low, Medium, or High" }),
  }),
  energy: z.enum(["Low", "Okay", "Good", "Great"], {
    errorMap: () => ({ message: "Energy must be Low, Okay, Good, or Great" }),
  }),
  notes: z.string().nullable(),
  createdAt: z.string(),
})

export type WeightLogType = z.infer<typeof WeightLogSchema>

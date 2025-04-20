import { z } from "zod"


export const ExpenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  amount: z.number(),
  description: z.string().nullable(),
  date: z.date(),
})

export type ExpenseType = z.infer<typeof ExpenseSchema>


import z from "zod"

export const TaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  completed: z.boolean(),
  dueDate: z.date().nullable(),
  category: z.string(),
  createdAt: z.date(),
})

export type TaskType = z.infer<typeof TaskSchema>

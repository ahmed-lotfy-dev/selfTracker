import z from "zod"

export const TaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  completed: z.boolean(),
  dueDate: z.string().datetime().nullable(),
  category: z.enum(["workout", "finance", "general"]),
  createdAt: z.string().datetime(),
})

export type TaskType = z.infer<typeof TaskSchema>

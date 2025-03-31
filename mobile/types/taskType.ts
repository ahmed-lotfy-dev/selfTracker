export interface TaskType {
  id: string
  userId: string
  title: string
  description: string
  completed: boolean
  dueDate: string
  category: "workout" | "finance" | "general"
  createdAt: string
  updatedAt: string
}

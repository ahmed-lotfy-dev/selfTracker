import { axiosInstance } from "./config"

export interface Task {
  id: string
  userId: string
  title: string
  completed: boolean
  category: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  dueDate: string | null
  description: string | null
  projectId: string | null
  columnId: string | null
  priority: string
  order: number
  completedAt: string | null
}

export async function getTasks(): Promise<Task[]> {
  const res = await axiosInstance.get<Task[]>("/api/tasks")
  return (res.data as any[]).map((t) => ({
    id: t.id,
    userId: t.userId || "",
    title: t.title,
    completed: t.completed ?? false,
    category: t.category || "general",
    createdAt: t.createdAt,
    updatedAt: t.updatedAt || t.createdAt,
    deletedAt: t.deletedAt || null,
    dueDate: t.dueDate || null,
    description: t.description || null,
    projectId: t.projectId || null,
    columnId: t.columnId || null,
    priority: t.priority || "medium",
    order: t.order ?? 0,
    completedAt: t.completedAt || null,
  }))
}

export async function createTask(data: { title: string; category?: string; priority?: string }) {
  const res = await axiosInstance.post<{ task: Task }>("/api/tasks", data)
  return res.data.task
}

export async function updateTask(id: string, data: Partial<Task>) {
  const res = await axiosInstance.patch<{ task: Task }>(`/api/tasks/${id}`, data)
  return res.data.task
}

export async function deleteTask(id: string) {
  await axiosInstance.delete(`/api/tasks/${id}`)
}

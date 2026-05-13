import axiosInstance from "./axiosInstance"
import { API_BASE_URL } from "./config"
import type { Task } from "@/src/stores/useTasksStore"

export const getTasks = async (): Promise<Task[]> => {
  const url = `${API_BASE_URL}/api/tasks`
  const response = await axiosInstance.get(url)

  // The API returns the tasks array directly
  return (response.data as any[]).map((task: any) => ({
    id: task.id,
    userId: task.userId || '',
    title: task.title,
    completed: task.completed ?? false,
    category: task.category || 'general',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt || task.createdAt,
    deletedAt: task.deletedAt || null,
    dueDate: task.dueDate || null,
    description: task.description || null,
    projectId: task.projectId || null,
    columnId: task.columnId || null,
    priority: task.priority || 'medium',
    order: task.order ?? 0,
    completedAt: task.completedAt || null,
  }))
}

import axiosInstance from "@/lib/api/axiosInstance"
import { Task } from "@/types/kanban"

export interface CreateTaskDTO {
  title: string
  projectId?: string
  columnId?: string
  priority?: "low" | "medium" | "high"
  order?: number
  description?: string
  dueDate?: Date | string
  category?: string
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  completed?: boolean
}

export async function getTasks(): Promise<Task[]> {
  const res = await axiosInstance.get("/tasks")
  return res.data
}

export async function createTask(data: CreateTaskDTO): Promise<Task> {
  const res = await axiosInstance.post("/tasks", data)
  return res.data.task
}

export async function updateTask(id: string, data: UpdateTaskDTO): Promise<Task> {
  const res = await axiosInstance.patch(`/tasks/${id}`, data)
  return res.data.task
}

export async function deleteTask(id: string): Promise<void> {
  await axiosInstance.delete(`/tasks/${id}`)
}

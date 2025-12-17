import { backendUrl } from "@/lib/api"
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
  const res = await fetch(`${backendUrl}/api/tasks`)
  if (!res.ok) throw new Error("Failed to fetch tasks")
  return res.json()
}

export async function createTask(data: CreateTaskDTO): Promise<Task> {
  const res = await fetch(`${backendUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create task")
  const json = await res.json()
  return json.task
}

export async function updateTask(id: string, data: UpdateTaskDTO): Promise<Task> {
  const res = await fetch(`${backendUrl}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update task")
  const json = await res.json()
  return json.task
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${backendUrl}/api/tasks/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete task")
}

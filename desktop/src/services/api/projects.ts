import { backendUrl } from "@/lib/api"
import { Project, Task } from "@/types/kanban"

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${backendUrl}/api/tasks`, {
    headers: { "Content-Type": "application/json" }, // Auth handled by cookies? Assuming yes.
  })
  if (!res.ok) throw new Error("Failed to fetch tasks")
  const json = await res.json()
  return json // backend returns array directly or {data: ...}?
  // tasksRouter.get returns c.json(userTasks) which is array.
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${backendUrl}/api/projects`, {
    headers: {
      "Content-Type": "application/json",
      // Auth? Better Auth usually handles cookies. 
      // Ensure backend CORS and session cookie settings are correct for Tauri.
      // If native, might need to manually attach headers if not using cookie-based auth properly.
      // Assuming cookie-based auth on same domain or properly configured CORS proxy with credentials.
    },
  })
  if (!res.ok) throw new Error("Failed to fetch projects")
  const json = await res.json()
  return json.data
}

export async function createProject(name: string, color?: string): Promise<Project> {
  const res = await fetch(`${backendUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, color }),
  })
  if (!res.ok) throw new Error("Failed to create project")
  const json = await res.json()
  return json.data
}

// Additional endpoints for moving tasks (updating columnId/order)
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${backendUrl}/api/tasks/${taskId}`, { // Using existing tasks endpoint (patched to support new fields)
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error("Failed to update task")
  const json = await res.json()
  return json.task
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const res = await fetch(`${backendUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
  if (!res.ok) throw new Error("Failed to create task")
  const json = await res.json()
  return json.task
}

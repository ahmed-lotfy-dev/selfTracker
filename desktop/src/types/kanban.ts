export type Priority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description?: string
  priority?: Priority
  dueDate?: Date | string
  completed: boolean
  projectId?: string
  columnId?: string
  order?: number
  // Backend specific fields
  userId: string
  createdAt: string
  updatedAt: string
  completedAt?: string | null
}

export type ColumnType = "todo" | "doing" | "done"

export interface Column {
  id: string
  projectId: string
  name: string
  order: number
  type: ColumnType
  tasks?: Task[]
}

export interface Project {
  id: string
  name: string
  color: string
  isArchived: boolean
  columns: Column[]
  createdAt: string
  updatedAt: string
}

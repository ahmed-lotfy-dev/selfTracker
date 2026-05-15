import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'
import { getTasks } from '@/src/lib/api/tasksApi'
import { getPowerSyncDB } from '@/src/db/powerSyncClient'

export type Task = {
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

const STORAGE_KEY = 'local-tasks'

const loadTasks = (): Task[] => {
  const data = mmkvStorage.getItem<Task[]>(STORAGE_KEY) ?? []
  console.log(`[MMKV] Loaded ${data.length} tasks from local storage`)
  return data
}

const saveTasks = (tasks: Task[]) => {
  mmkvStorage.setItem(STORAGE_KEY, tasks)
}

type TasksState = {
  tasks: Task[]
  isLoading: boolean
  setTasks: (tasks: Task[]) => void
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string) => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: loadTasks(),
  isLoading: false,

  setTasks: (tasks) => {
    const uniqueTasks = Array.from(new Map(tasks.map(t => [t.id, t])).values())
    if (uniqueTasks.length !== tasks.length) {
      console.warn('[useTasksStore] Detected duplicates in setTasks! Filtering...', tasks.length - uniqueTasks.length)
    }
    saveTasks(uniqueTasks)
    set({ tasks: uniqueTasks })
  },

  fetchTasks: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const serverTasks = await getTasks()
      const existingTasks = get().tasks
      const newTasks = serverTasks.filter(
        (t) => !existingTasks.some((e) => e.id === t.id)
      )
      const merged = [...existingTasks, ...newTasks]
      const unique = Array.from(new Map(merged.map(t => [t.id, t])).values())
      saveTasks(unique)
      set({ tasks: unique })
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  addTask: (taskData) => {
    const task: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }
    const newTasks = [task, ...get().tasks]
    saveTasks(newTasks)
    set({ tasks: newTasks })

    // Write to PowerSync SQLite — syncs automatically
    try {
      getPowerSyncDB().then(db => {
        db.execute(
          'INSERT OR REPLACE INTO tasks (id, user_id, title, completed, created_at, updated_at, deleted_at, category, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [task.id, task.userId, task.title, task.completed ? 1 : 0, task.createdAt, task.updatedAt, task.deletedAt, task.category || 'general', task.priority || 'medium']
        )
      })
    } catch (e) {
      console.error('Failed to write task to PowerSync:', e)
    }
  },

  updateTask: (id, updates) => {
    let updatedTask: Task | null = null
    const newTasks = get().tasks.map((t) => {
      if (t.id === id) {
        updatedTask = { ...t, ...updates, updatedAt: new Date().toISOString() }
        return updatedTask
      }
      return t
    })
    saveTasks(newTasks)
    set({ tasks: newTasks })

    if (updatedTask) {
      try {
        getPowerSyncDB().then(db => {
          db.execute(
            'UPDATE tasks SET title = ?, completed = ?, updated_at = ?, deleted_at = ?, category = ?, priority = ? WHERE id = ?',
            [updatedTask.title, updatedTask.completed ? 1 : 0, updatedTask.updatedAt, updatedTask.deletedAt, updatedTask.category, updatedTask.priority, updatedTask.id]
          )
        })
      } catch (e) {
        console.error('Failed to update task in PowerSync:', e)
      }
    }
  },

  deleteTask: (id) => {
    let deletedTask: Task | null = null
    const newTasks = get().tasks.map((t) => {
      if (t.id === id) {
        deletedTask = { ...t, deletedAt: new Date().toISOString() }
        return deletedTask
      }
      return t
    })
    saveTasks(newTasks)
    set({ tasks: newTasks })

    if (deletedTask) {
      try {
        getPowerSyncDB().then(db => {
          db.execute('DELETE FROM tasks WHERE id = ?', [deletedTask.id])
        })
      } catch (e) {
        console.error('Failed to delete task from PowerSync:', e)
      }
    }
  },

  toggleComplete: (id) => {
    const now = new Date().toISOString()
    let updatedTask: Task | null = null

    const newTasks = get().tasks.map((t) => {
      if (t.id === id) {
        updatedTask = {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? now : null,
          updatedAt: now,
        }
        return updatedTask
      }
      return t
    })
    saveTasks(newTasks)
    set({ tasks: newTasks })

    if (updatedTask) {
      try {
        getPowerSyncDB().then(db => {
          db.execute(
            'UPDATE tasks SET completed = ?, completed_at = ?, updated_at = ? WHERE id = ?',
            [updatedTask.completed ? 1 : 0, updatedTask.completedAt, updatedTask.updatedAt, updatedTask.id]
          )
        })
      } catch (e) {
        console.error('Failed to toggle task in PowerSync:', e)
      }
    }
  },
}))

export const useActiveTasks = () => {
  const tasks = useTasksStore((s) => s.tasks)
  return tasks.filter((t) => !t.deletedAt)
}

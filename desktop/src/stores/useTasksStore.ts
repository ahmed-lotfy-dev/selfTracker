import { create } from 'zustand'
import { mmkvStorage } from '@/lib/storage/mmkv'

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
  console.log(`[Storage] Loaded ${data.length} tasks from local storage`)
  return data
}

const saveTasks = (tasks: Task[]) => {
  mmkvStorage.setItem(STORAGE_KEY, tasks)
}

type TasksState = {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string) => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: loadTasks(),

  setTasks: (tasks) => {
    const uniqueTasks = Array.from(new Map(tasks.map(t => [t.id, t])).values())
    if (uniqueTasks.length !== tasks.length) {
      console.warn('[useTasksStore] Detected duplicates in setTasks! Filtering...', tasks.length - uniqueTasks.length)
    }
    saveTasks(uniqueTasks)
    set({ tasks: uniqueTasks })
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

    // Sync to DB
    try {
      const { SyncManager } = require('../../lib/sync/SyncManager')
      SyncManager.pushTask(task)
    } catch (e) {
      console.error('Failed to sync task:', e)
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
        const { SyncManager } = require('../../lib/sync/SyncManager')
        SyncManager.pushTask(updatedTask)
      } catch (e) {
        console.error('Failed to sync updated task:', e)
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
        const { SyncManager } = require('../../lib/sync/SyncManager')
        SyncManager.pushTask(deletedTask)
      } catch (e) {
        console.error('Failed to sync deleted task:', e)
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
        const { SyncManager } = require('../../lib/sync/SyncManager')
        SyncManager.pushTask(updatedTask)
      } catch (e) {
        console.error('Failed to sync task completion:', e)
      }
    }
  },
}))

export const useActiveTasks = () => {
  const tasks = useTasksStore((s) => s.tasks)
  return tasks.filter((t) => !t.deletedAt)
}

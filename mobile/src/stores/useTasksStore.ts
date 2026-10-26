import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'
import { getTasks } from '@/src/lib/api/tasksApi'
import { nowISO, todayLocal } from '@/src/lib/dateUtils'
import { getZero, type AppZero } from '@/src/zero/client'
import { anyDateToEpoch, toEpoch } from '@/src/zero/mappers'
import { mutators } from '@/src/zero/mutators'
import type { MutatorResult } from '@rocicorp/zero'

/**
 * Tasks store.
 *
 * Reads: Zero materializes the `tasks` custom query into `setTasks()` (see
 * `src/zero/sync.ts`); MMKV is only a cold-start cache so the list is never
 * empty while the replica opens. `fetchTasks()` remains as an explicit REST
 * fallback for the needs-auth / no-Zero case.
 *
 * Writes: optimistic local update (instant UI) + a Zero custom mutator
 * (`task.insert|update|delete`). Zero queues mutations while offline and pushes
 * them on reconnect, so there is no separate upload queue any more.
 */

const STORAGE_KEY = 'local-tasks'

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

const loadTasks = (): Task[] => {
  const data = mmkvStorage.getItem<Task[]>(STORAGE_KEY) ?? []
  console.log(`[MMKV] Loaded ${data.length} tasks from local storage`)
  return data
}

const saveTasks = (tasks: Task[]) => {
  mmkvStorage.setItem(STORAGE_KEY, tasks)
}

type TaskPriority = 'low' | 'medium' | 'high'

function asPriority(value: string | null | undefined): TaskPriority {
  return value === 'low' || value === 'high' ? value : 'medium'
}

/** Fire-and-forget custom mutator; logs server-side rejections. */
function sendTaskMutation(label: string, run: (zero: AppZero) => MutatorResult) {
  const zero = getZero()
  if (!zero) {
    console.warn(`[tasks] Zero not initialized — "${label}" is local-only`)
    return
  }
  try {
    void run(zero)
      .server.then((details: any) => {
        if (details?.type === 'error') {
          console.warn(`[tasks] mutator "${label}" rejected:`, details.error)
        }
      })
      .catch((err: unknown) => {
        console.warn(`[tasks] mutator "${label}" failed:`, err)
      })
  } catch (err) {
    console.warn(`[tasks] mutator "${label}" threw:`, err)
  }
}

/** Maps a partial domain task onto the mutator's partial args. */
function taskPatch(updates: Partial<Task>) {
  const patch: Record<string, unknown> = {}
  if (updates.title !== undefined) patch.title = updates.title
  if (updates.description !== undefined) patch.description = updates.description
  if (updates.completed !== undefined) patch.completed = updates.completed
  if (updates.dueDate !== undefined) patch.dueDate = toEpoch(updates.dueDate)
  if (updates.priority !== undefined) patch.priority = asPriority(updates.priority)
  if (updates.order !== undefined) patch.order = updates.order
  if (updates.category !== undefined) patch.category = updates.category
  if (updates.projectId !== undefined) patch.projectId = updates.projectId
  if (updates.columnId !== undefined) patch.columnId = updates.columnId
  if (updates.completedAt !== undefined) patch.completedAt = anyDateToEpoch(updates.completedAt)
  return patch
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
    // Zero streams changes; REST is only the fallback when it is not running.
    if (getZero()) return
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
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined' && console.error) {
        console.error('Failed to fetch tasks:', e)
      }
    } finally {
      set({ isLoading: false })
    }
  },

  addTask: (taskData) => {
    const task: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
      deletedAt: null,
    }
    const newTasks = [task, ...get().tasks]
    saveTasks(newTasks)
    set({ tasks: newTasks })

    sendTaskMutation('task.insert', (zero) =>
      zero.mutate(mutators.task.insert({
        id: task.id,
        userId: task.userId || undefined,
        title: task.title,
        description: task.description,
        completed: task.completed,
        dueDate: toEpoch(task.dueDate),
        priority: asPriority(task.priority),
        order: task.order,
        category: task.category,
        completedAt: anyDateToEpoch(task.completedAt),
      }))
    )
  },

  updateTask: (id, updates) => {
    const now = nowISO()
    let updatedTask: Task | null = null
    const newTasks = get().tasks.map((t) => {
      if (t.id === id) {
        updatedTask = { ...t, ...updates, updatedAt: now }
        return updatedTask
      }
      return t
    })
    saveTasks(newTasks)
    set({ tasks: newTasks })

    if (updatedTask) {
      const patch = taskPatch(updates)
      if (Object.keys(patch).length === 0) return
      sendTaskMutation('task.update', (zero) =>
        zero.mutate(mutators.task.update({ id, ...patch }))
      )
    }
  },

  deleteTask: (id) => {
    const now = nowISO()
    let deletedTask: Task | null = null
    const newTasks = get().tasks.map((t) => {
      if (t.id === id) {
        deletedTask = { ...t, deletedAt: now }
        return deletedTask
      }
      return t
    })
    saveTasks(newTasks)
    set({ tasks: newTasks })

    if (deletedTask) {
      sendTaskMutation('task.delete', (zero) => zero.mutate(mutators.task.delete({ id })))
    }
  },

  toggleComplete: (id) => {
    const now = nowISO()
    const today = todayLocal()
    let updatedTask: Task | null = null

    const newTasks = get().tasks.map((t) => {
      if (t.id === id) {
        updatedTask = {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? today : null,
          updatedAt: now,
        }
        return updatedTask
      }
      return t
    })
    saveTasks(newTasks)
    set({ tasks: newTasks })

    if (updatedTask) {
      const task = updatedTask as Task
      sendTaskMutation('task.update', (zero) =>
        zero.mutate(mutators.task.update({
          id,
          completed: task.completed,
          completedAt: anyDateToEpoch(task.completedAt),
        }))
      )
    }
  },
}))

export const useActiveTasks = () => {
  const tasks = useTasksStore((s) => s.tasks)
  return tasks.filter((t) => !t.deletedAt)
}

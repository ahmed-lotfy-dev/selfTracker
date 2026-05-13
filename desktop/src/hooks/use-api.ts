import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/lib/api/axiosInstance"
import { useUserStore } from "@/lib/user-store"
import { useTasksStore } from "@/stores/useTasksStore"
import { useHabitsStore } from "@/stores/useHabitsStore"
import { useWeightStore } from "@/stores/useWeightStore"
import { useWorkoutsStore } from "@/stores/useWorkoutsStore"

// --- Helpers ---

function isAuthenticated() {
  return !!localStorage.getItem("bearer_token")
}

// --- TASKS ---

export function useApiTasks() {
  return useQuery({
    queryKey: ["api", "tasks"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/tasks")
      const data = res.data
      const tasks = Array.isArray(data) ? data : (data.tasks || data.data || [])
      return tasks
    },
    enabled: isAuthenticated(),
    staleTime: 30000,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const store = useTasksStore()
  return useMutation({
    mutationFn: async (task: any) => {
      if (!isAuthenticated()) {
        store.addTask(task)
        return task
      }
      const res = await axiosInstance.post("/api/tasks", task)
      queryClient.invalidateQueries({ queryKey: ["api", "tasks"] })
      return res.data
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  const store = useTasksStore()
  return useMutation({
    mutationFn: async (taskId: string) => {
      const task = store.tasks.find(t => t.id === taskId)
      if (!task) return
      const updated = { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null }
      store.toggleComplete(taskId)
      if (isAuthenticated()) {
        await axiosInstance.patch(`/api/tasks/${taskId}`, { completed: updated.completed, completedAt: updated.completedAt })
        queryClient.invalidateQueries({ queryKey: ["api", "tasks"] })
      }
    },
  })
}

// --- HABITS ---

export function useApiHabits() {
  return useQuery({
    queryKey: ["api", "habits"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/habits")
      const data = res.data
      const habits = data.habits || data.data || (Array.isArray(data) ? data : [])
      return habits
    },
    enabled: isAuthenticated(),
    staleTime: 30000,
  })
}

export function useCreateHabit() {
  const queryClient = useQueryClient()
  const store = useHabitsStore()
  return useMutation({
    mutationFn: async (habit: any) => {
      if (!isAuthenticated()) {
        store.addHabit(habit)
        return habit
      }
      const res = await axiosInstance.post("/api/habits", habit)
      queryClient.invalidateQueries({ queryKey: ["api", "habits"] })
      return res.data
    },
  })
}

export function useToggleHabit() {
  const queryClient = useQueryClient()
  const store = useHabitsStore()
  return useMutation({
    mutationFn: async (habitId: string) => {
      store.toggleComplete(habitId)
      if (isAuthenticated()) {
        const today = new Date().toISOString().slice(0, 10)
        await axiosInstance.post(`/api/habits/${habitId}/complete`, { date: today, completed: true })
        queryClient.invalidateQueries({ queryKey: ["api", "habits"] })
      }
    },
  })
}

// --- WEIGHT ---

export function useApiWeights() {
  return useQuery({
    queryKey: ["api", "weights"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/weightLogs?limit=500")
      const data = res.data
      return data.logs || data.data || (Array.isArray(data) ? data : [])
    },
    enabled: isAuthenticated(),
    staleTime: 30000,
  })
}

export function useCreateWeight() {
  const queryClient = useQueryClient()
  const store = useWeightStore()
  return useMutation({
    mutationFn: async (log: any) => {
      if (isAuthenticated()) {
        const res = await axiosInstance.post("/api/weightLogs", log)
        queryClient.invalidateQueries({ queryKey: ["api", "weights"] })
        return res.data
      }
      store.addWeightLog(log)
    },
  })
}

export function useDeleteWeight() {
  const queryClient = useQueryClient()
  const store = useWeightStore()
  return useMutation({
    mutationFn: async (id: string) => {
      store.deleteWeightLog(id)
      if (isAuthenticated()) {
        await axiosInstance.delete(`/api/weightLogs/${id}`)
        queryClient.invalidateQueries({ queryKey: ["api", "weights"] })
      }
    },
  })
}

// --- WORKOUTS ---

export function useApiWorkouts() {
  return useQuery({
    queryKey: ["api", "workouts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/workoutLogs?limit=500")
      const data = res.data
      return data.logs || data.data || (Array.isArray(data) ? data : [])
    },
    enabled: isAuthenticated(),
    staleTime: 30000,
  })
}

// --- Bulk fetch for AppProviders ---

export async function fetchAllFromApi() {
  const token = localStorage.getItem("bearer_token")
  if (!token) return

  console.log("[API] Fetching all data from REST API...")

  const headers = { Authorization: `Bearer ${token}` }

  // Tasks
  try {
    const res = await axiosInstance.get("/api/tasks", { headers })
    const data = res.data
    const tasks = Array.isArray(data) ? data : (data.tasks || data.data || [])
    if (tasks.length > 0) {
      useTasksStore.getState().setTasks(tasks.map((t: any) => ({
        id: t.id,
        userId: t.userId || t.user_id || token,
        title: t.title,
        completed: !!t.completed,
        category: t.category || 'general',
        createdAt: t.createdAt || t.created_at || new Date().toISOString(),
        updatedAt: t.updatedAt || t.updated_at || new Date().toISOString(),
        deletedAt: t.deletedAt || t.deleted_at || null,
        dueDate: t.dueDate || t.due_date || null,
        description: t.description || null,
        projectId: t.projectId || t.project_id || null,
        columnId: t.columnId || t.column_id || null,
        priority: t.priority || 'medium',
        order: t.order || 0,
        completedAt: t.completedAt || t.completed_at || null,
      })))
      console.log(`[API] Loaded ${tasks.length} tasks`)
    }
  } catch (e: any) {
    if (e.response?.status !== 404) console.warn("[API] Failed to fetch tasks:", e.message)
  }

  // Habits
  try {
    const res = await axiosInstance.get("/api/habits", { headers })
    const data = res.data
    const habits = data.habits || data.data || (Array.isArray(data) ? data : [])
    if (habits.length > 0) {
      useHabitsStore.getState().setHabits(habits.map((h: any) => ({
        id: h.id,
        userId: h.userId || h.user_id || token,
        name: h.name,
        description: h.description || null,
        color: h.color || '#10B981',
        streak: h.streak || 0,
        completedToday: !!h.completedToday || !!h.completed_today,
        lastCompletedAt: h.lastCompletedAt || h.last_completed_at || null,
        createdAt: h.createdAt || h.created_at || new Date().toISOString(),
        updatedAt: h.updatedAt || h.updated_at || new Date().toISOString(),
        deletedAt: h.deletedAt || h.deleted_at || null,
      })))
      console.log(`[API] Loaded ${habits.length} habits`)
    }
  } catch (e: any) {
    if (e.response?.status !== 404) console.warn("[API] Failed to fetch habits:", e.message)
  }

  // Weights
  try {
    const res = await axiosInstance.get("/api/weightLogs?limit=500", { headers })
    const data = res.data
    const logs = data.logs || data.data || (Array.isArray(data) ? data : [])
    if (logs.length > 0) {
      useWeightStore.getState().setWeightLogs(logs.map((w: any) => ({
        id: w.id,
        userId: w.userId || w.user_id || token,
        weight: w.weight,
        notes: w.notes || null,
        mood: w.mood || null,
        energy: w.energy || null,
        createdAt: w.createdAt || w.created_at || new Date().toISOString(),
        updatedAt: w.updatedAt || w.updated_at || new Date().toISOString(),
        deletedAt: w.deletedAt || w.deleted_at || null,
      })))
      console.log(`[API] Loaded ${logs.length} weight logs`)
    }
  } catch (e: any) {
    if (e.response?.status !== 404) console.warn("[API] Failed to fetch weights:", e.message)
  }

  // Workouts
  try {
    const res = await axiosInstance.get("/api/workoutLogs?limit=500", { headers })
    const data = res.data
    const logs = data.logs || data.data || (Array.isArray(data) ? data : [])
    if (logs.length > 0) {
      useWorkoutsStore.getState().setWorkoutLogs(logs.map((w: any) => ({
        id: w.id,
        userId: w.userId || w.user_id || token,
        workoutId: w.workoutId || w.workout_id || '',
        workoutName: w.workoutName || w.workout_name || 'Workout',
        notes: w.notes || null,
        createdAt: w.createdAt || w.created_at || new Date().toISOString(),
        updatedAt: w.updatedAt || w.updated_at || new Date().toISOString(),
        deletedAt: w.deletedAt || w.deleted_at || null,
      })))
      console.log(`[API] Loaded ${logs.length} workout logs`)
    }
  } catch (e: any) {
    if (e.response?.status !== 404) console.warn("[API] Failed to fetch workouts:", e.message)
  }
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TasksStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'completed' | 'completed_at'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  clearTasks: () => void;
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (taskData) => set((state) => ({
        tasks: [...state.tasks, {
          ...taskData,
          id: crypto.randomUUID(),
          user_id: 'local',
          completed: false,
          completed_at: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      clearTasks: () => set({ tasks: [] }),
    }),
    { name: 'tasks-storage' }
  )
);

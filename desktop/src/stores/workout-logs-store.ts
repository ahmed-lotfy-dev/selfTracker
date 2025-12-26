import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkoutLog {
  id: string;
  workout_name: string;
  workout_id: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WorkoutLogsStore {
  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: Omit<WorkoutLog, 'id' | 'updated_at' | 'user_id'> & { created_at?: string }) => void;
  updateWorkoutLog: (id: string, updates: Partial<WorkoutLog>) => void;
  deleteWorkoutLog: (id: string) => void;
  clearWorkoutLogs: () => void;
}

export const useWorkoutLogsStore = create<WorkoutLogsStore>()(
  persist(
    (set) => ({
      workoutLogs: [],

      addWorkoutLog: (logData) => set((state) => ({
        workoutLogs: [...state.workoutLogs, {
          ...logData,
          id: crypto.randomUUID(),
          user_id: 'local',
          created_at: logData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      })),

      updateWorkoutLog: (id, updates) => set((state) => ({
        workoutLogs: state.workoutLogs.map(w =>
          w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w
        )
      })),

      deleteWorkoutLog: (id) => set((state) => ({
        workoutLogs: state.workoutLogs.filter(w => w.id !== id)
      })),

      clearWorkoutLogs: () => set({ workoutLogs: [] }),
    }),
    { name: 'workout-logs-storage' }
  )
);

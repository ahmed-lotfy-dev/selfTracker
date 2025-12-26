import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Workout {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WorkoutsStore {
  workouts: Workout[];
  isLoading: boolean;
  lastFetched: string | null;
  setWorkouts: (workouts: Workout[]) => void;
  setLoading: (loading: boolean) => void;
  addWorkout: (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  clearWorkouts: () => void;
}

export const useWorkoutsStore = create<WorkoutsStore>()(
  persist(
    (set) => ({
      workouts: [],
      isLoading: false,
      lastFetched: null,

      setWorkouts: (workouts) => set({
        workouts,
        lastFetched: new Date().toISOString(),
        isLoading: false
      }),

      setLoading: (isLoading) => set({ isLoading }),

      addWorkout: (workoutData) => set((state) => ({
        workouts: [...state.workouts, {
          ...workoutData,
          id: crypto.randomUUID(),
          user_id: 'local',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      })),

      clearWorkouts: () => set({ workouts: [], lastFetched: null }),
    }),
    { name: 'workouts-storage' }
  )
);

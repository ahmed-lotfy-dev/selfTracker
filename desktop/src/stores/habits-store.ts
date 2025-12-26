import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface HabitsStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'streak' | 'completedToday'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  clearHabits: () => void;
}

export const useHabitsStore = create<HabitsStore>()(
  persist(
    (set) => ({
      habits: [],

      addHabit: (habitData) => set((state) => ({
        habits: [...state.habits, {
          ...habitData,
          id: crypto.randomUUID(),
          user_id: 'local',
          streak: 0,
          completedToday: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      })),

      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map(h =>
          h.id === id ? { ...h, ...updates, updated_at: new Date().toISOString() } : h
        )
      })),

      toggleHabit: (id) => set((state) => ({
        habits: state.habits.map(h => {
          if (h.id === id) {
            const isCompleting = !h.completedToday;
            return {
              ...h,
              completedToday: isCompleting,
              streak: isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1),
              updated_at: new Date().toISOString(),
            };
          }
          return h;
        })
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id)
      })),

      clearHabits: () => set({ habits: [] }),
    }),
    { name: 'habits-storage' }
  )
);

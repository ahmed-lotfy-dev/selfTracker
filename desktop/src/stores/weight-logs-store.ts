import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WeightLog {
  id: string;
  weight: string;
  mood: string;
  energy: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WeightLogsStore {
  weightLogs: WeightLog[];
  addWeightLog: (log: Omit<WeightLog, 'id' | 'updated_at' | 'user_id'> & { created_at?: string }) => void;
  updateWeightLog: (id: string, updates: Partial<WeightLog>) => void;
  deleteWeightLog: (id: string) => void;
  clearWeightLogs: () => void;
}

export const useWeightLogsStore = create<WeightLogsStore>()(
  persist(
    (set) => ({
      weightLogs: [],

      addWeightLog: (logData) => set((state) => ({
        weightLogs: [...state.weightLogs, {
          ...logData,
          id: crypto.randomUUID(),
          user_id: 'local',
          created_at: logData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      })),

      updateWeightLog: (id, updates) => set((state) => ({
        weightLogs: state.weightLogs.map(w =>
          w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w
        )
      })),

      deleteWeightLog: (id) => set((state) => ({
        weightLogs: state.weightLogs.filter(w => w.id !== id)
      })),

      clearWeightLogs: () => set({ weightLogs: [] }),
    }),
    { name: 'weight-logs-storage' }
  )
);

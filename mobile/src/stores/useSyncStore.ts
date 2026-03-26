import { create } from "zustand"

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface SyncState {
  tables: Record<string, SyncStatus>
  isInitialSyncComplete: boolean
  setTableStatus: (table: string, status: SyncStatus) => void
  checkInitialSync: () => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  tables: {
    tasks: 'idle',
    habits: 'idle',
    workouts: 'idle',
    workout_logs: 'idle',
    weight_logs: 'idle',
    food_logs: 'idle',
  },
  isInitialSyncComplete: false,

  setTableStatus: (table, status) => {
    set((state) => ({
      tables: { ...state.tables, [table]: status },
    }))
    get().checkInitialSync()
  },

  checkInitialSync: () => {
    const { tables } = get()
    const importantTables = ['tasks', 'habits', 'workout_logs', 'weight_logs']
    const allSynced = importantTables.every((t) => tables[t] === 'synced')
    
    if (allSynced && !get().isInitialSyncComplete) {
      set({ isInitialSyncComplete: true })
    }
  },
}))

import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'

export type WeightLog = {
  id: string
  userId: string
  weight: string
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

const STORAGE_KEY = 'local-weight-logs'

const loadWeightLogs = (): WeightLog[] => {
  return mmkvStorage.getItem<WeightLog[]>(STORAGE_KEY) ?? []
}

const saveWeightLogs = (logs: WeightLog[]) => {
  mmkvStorage.setItem(STORAGE_KEY, logs)
}

type CheckWeightState = {
  weightLogs: WeightLog[]
  setWeightLogs: (logs: WeightLog[]) => void
  addWeightLog: (log: Omit<WeightLog, 'id' | 'updatedAt' | 'deletedAt'> & { createdAt?: string }) => void
  updateWeightLog: (id: string, updates: Partial<WeightLog>) => void
  deleteWeightLog: (id: string) => void
}

export const useWeightStore = create<CheckWeightState>((set, get) => ({
  weightLogs: loadWeightLogs(),

  setWeightLogs: (logs) => {
    saveWeightLogs(logs)
    set({ weightLogs: logs })
  },

  updateWeightLog: (id, updates) => {
    let updatedLog: WeightLog | null = null
    const newLogs = get().weightLogs.map((l) => {
      if (l.id === id) {
        updatedLog = { ...l, ...updates, updatedAt: new Date().toISOString() }
        return updatedLog
      }
      return l
    })
    saveWeightLogs(newLogs)
    set({ weightLogs: newLogs })

    if (updatedLog) {
      try {
        const { SyncManager } = require('@/src/services/SyncManager')
        SyncManager.pushWeightLog(updatedLog)
      } catch (e) {
        console.error('Failed to sync updated weight log:', e)
      }
    }
  },

  addWeightLog: (logData) => {
    const log: WeightLog = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: logData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }
    const newLogs = [log, ...get().weightLogs]
    saveWeightLogs(newLogs)
    set({ weightLogs: newLogs })

    try {
      const { SyncManager } = require('@/src/services/SyncManager')
      SyncManager.pushWeightLog(log)
    } catch (e) {
      console.error('Failed to sync weight log:', e)
    }
  },

  deleteWeightLog: (id) => {
    let deletedLog: WeightLog | null = null
    const newLogs = get().weightLogs.map((l) => {
      if (l.id === id) {
        deletedLog = { ...l, deletedAt: new Date().toISOString() }
        return deletedLog
      }
      return l
    })
    saveWeightLogs(newLogs)
    set({ weightLogs: newLogs })

    if (deletedLog) {
      try {
        const { SyncManager } = require('@/src/services/SyncManager')
        SyncManager.pushWeightLog(deletedLog)
      } catch (e) {
        console.error('Failed to sync deleted weight log:', e)
      }
    }
  },
}))

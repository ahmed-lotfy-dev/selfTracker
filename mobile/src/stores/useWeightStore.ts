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
  nextCursor: string | null
  isLoading: boolean
  hasMore: boolean
  setWeightLogs: (logs: WeightLog[]) => void
  addWeightLog: (log: Omit<WeightLog, 'id' | 'updatedAt' | 'deletedAt'> & { createdAt?: string }) => void
  updateWeightLog: (id: string, updates: Partial<WeightLog>) => void
  deleteWeightLog: (id: string) => void
  fetchWeightLogs: (cursor?: string) => Promise<void>
  appendWeightLogs: (logs: WeightLog[], cursor: string | null) => void
  resetPagination: () => void
}

export const useWeightStore = create<CheckWeightState>((set, get) => ({
  weightLogs: loadWeightLogs(),
  nextCursor: null,
  isLoading: false,
  hasMore: true,

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

  fetchWeightLogs: async (cursor?: string) => {
    if (get().isLoading) return
    set({ isLoading: true })

    try {
      const { getWeightLogs } = await import('@/src/lib/api/weightLogsApi')
      const response = await getWeightLogs(cursor, 20)

      if (cursor) {
        get().appendWeightLogs(response.logs, response.nextCursor)
      } else {
        const existingLogs = get().weightLogs
        const newLogs = response.logs.filter(
          (newLog) => !existingLogs.some((existing) => existing.id === newLog.id)
        )
        const merged = [...existingLogs, ...newLogs]
        const uniqueLogs = Array.from(new Map(merged.map(l => [l.id, l])).values())
        saveWeightLogs(uniqueLogs)
        set({
          weightLogs: uniqueLogs,
          nextCursor: response.nextCursor,
          hasMore: response.nextCursor !== null,
        })
      }
    } catch (e) {
      console.error('Failed to fetch weight logs:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  appendWeightLogs: (logs, cursor) => {
    const existingLogs = get().weightLogs
    const newLogs = logs.filter(
      (newLog) => !existingLogs.some((existing) => existing.id === newLog.id)
    )
    const merged = [...existingLogs, ...newLogs]
    saveWeightLogs(merged)
    set({
      weightLogs: merged,
      nextCursor: cursor,
      hasMore: cursor !== null,
    })
  },

  resetPagination: () => {
    set({ nextCursor: null, hasMore: true })
  },
}))

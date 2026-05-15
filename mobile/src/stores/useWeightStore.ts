import { create } from 'zustand'
import { mmkvStorage } from '@/src/lib/storage/mmkv'
import { WeightLog } from '../types/weightType'
import { getPowerSyncDB } from '@/src/db/powerSyncClient'
import { nowISO } from '@/src/lib/dateUtils'

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
    const now = nowISO()
    let updatedLog: WeightLog | null = null
    const newLogs = get().weightLogs.map((l) => {
      if (l.id === id) {
        updatedLog = { ...l, ...updates, updatedAt: now }
        return updatedLog
      }
      return l
    })
    saveWeightLogs(newLogs)
    set({ weightLogs: newLogs })

    if (updatedLog) {
      try {
        getPowerSyncDB().then(db => {
          db.execute(
            'UPDATE weight_logs SET weight = ?, notes = ?, updated_at = ?, deleted_at = ? WHERE id = ?',
            [updatedLog!.weight, updatedLog!.notes, updatedLog!.updatedAt, updatedLog!.deletedAt, updatedLog!.id]
          )
        })
      } catch (e) {
        console.error('Failed to update weight log in PowerSync:', e)
      }
    }
  },

  addWeightLog: (logData) => {
    const log: WeightLog = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: logData.createdAt || nowISO(),
      updatedAt: nowISO(),
      deletedAt: null,
    }
    const newLogs = [log, ...get().weightLogs]
    saveWeightLogs(newLogs)
    set({ weightLogs: newLogs })

    try {
      getPowerSyncDB().then(db => {
        db.execute(
          'INSERT OR REPLACE INTO weight_logs (id, user_id, weight, notes, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [log.id, log.userId, log.weight, log.notes, log.createdAt, log.updatedAt, log.deletedAt]
        )
      })
    } catch (e) {
      console.error('Failed to write weight log to PowerSync:', e)
    }
  },

  deleteWeightLog: (id) => {
    const now = nowISO()
    let deletedLog: WeightLog | null = null
    const newLogs = get().weightLogs.map((l) => {
      if (l.id === id) {
        deletedLog = { ...l, deletedAt: now }
        return deletedLog
      }
      return l
    })
    saveWeightLogs(newLogs)
    set({ weightLogs: newLogs })

    if (deletedLog) {
      try {
        getPowerSyncDB().then(db => {
          db.execute('DELETE FROM weight_logs WHERE id = ?', [deletedLog!.id])
        })
      } catch (e) {
        console.error('Failed to delete weight log from PowerSync:', e)
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

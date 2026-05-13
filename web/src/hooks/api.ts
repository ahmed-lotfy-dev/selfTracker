import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAllWeightLogs } from "../lib/api/weightLogsApi"
import { getAllWorkoutLogs } from "../lib/api/workoutLogsApi"
import { getHome } from "../lib/api/userApi"
import type { WeightLog } from "../lib/api/weightLogsApi"
import type { WorkoutLog } from "../lib/api/workoutLogsApi"

function qKey(...args: string[]) {
  return ["fitness", ...args]
}

export function useUser() {
  return useQuery({
    queryKey: qKey("user"),
    queryFn: getHome,
    staleTime: 60_000,
  })
}

export function useWeightLogs() {
  return useQuery({
    queryKey: qKey("weightLogs"),
    queryFn: getAllWeightLogs,
    staleTime: 60_000,
  })
}

export function useWorkoutLogs() {
  return useQuery({
    queryKey: qKey("workoutLogs"),
    queryFn: getAllWorkoutLogs,
    staleTime: 60_000,
  })
}

export interface WeightStats {
  totalRecords: number
  dateRange: { first: string; last: string }
  weight: { start: number; current: number; min: number; max: number; change: number; avg: number }
  energy: Record<string, number>
  mood: Record<string, number>
  monthly: { month: string; avgWeight: number; entries: number }[]
  recentTrend: { date: string; weight: number; energy: string | null; mood: string | null; notes: string | null }[]
}

function computeWeightStats(logs: WeightLog[]): WeightStats {
  const weights = logs.map((l) => parseFloat(l.weight))
  const energy: Record<string, number> = {}
  const mood: Record<string, number> = {}
  const monthlyMap: Record<string, { t: number; c: number }> = {}

  for (const l of logs) {
    if (l.energy) energy[l.energy] = (energy[l.energy] || 0) + 1
    if (l.mood) mood[l.mood] = (mood[l.mood] || 0) + 1
    const m = l.createdAt.slice(0, 7)
    if (!monthlyMap[m]) monthlyMap[m] = { t: 0, c: 0 }
    monthlyMap[m].t += parseFloat(l.weight)
    monthlyMap[m].c++
  }

  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      avgWeight: Math.round((v.t / v.c) * 100) / 100,
      entries: v.c,
    }))

  return {
    totalRecords: logs.length,
    dateRange: {
      first: logs[0]?.createdAt || "",
      last: logs[logs.length - 1]?.createdAt || "",
    },
    weight: {
      start: weights[0] || 0,
      current: weights[weights.length - 1] || 0,
      min: Math.min(...weights) || 0,
      max: Math.max(...weights) || 0,
      change: Math.round(((weights[weights.length - 1] || 0) - (weights[0] || 0)) * 100) / 100,
      avg: weights.length ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 100) / 100 : 0,
    },
    energy,
    mood,
    monthly,
    recentTrend: logs.slice(-14).map((l) => ({
      date: l.createdAt,
      weight: parseFloat(l.weight),
      energy: l.energy,
      mood: l.mood,
      notes: l.notes,
    })),
  }
}

export function useWeightStats() {
  const { data: logs, isLoading, error } = useWeightLogs()
  const data = useMemo(() => (logs ? computeWeightStats(logs) : undefined), [logs])
  return { data, isLoading, error: error as Error | null }
}

export interface WorkoutStats {
  totalSessions: number
  dateRange: { first: string; last: string }
  types: Record<string, number>
  monthly: Record<string, number>
  streaks: { current: number; max: number }
  recentSessions: { date: string; name: string; notes: string | null }[]
}

function computeWorkoutStats(logs: WorkoutLog[]): WorkoutStats {
  const types: Record<string, number> = {}
  const monthly: Record<string, number> = {}
  const dates = new Set<string>()

  for (const l of logs) {
    const n = l.workoutName || "Unknown"
    types[n] = (types[n] || 0) + 1
    const m = l.createdAt.slice(0, 7)
    monthly[m] = (monthly[m] || 0) + 1
    dates.add(l.createdAt.slice(0, 10))
  }

  const sortedDates = [...dates].sort()
  let maxStreak = 0
  let tempStreak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const diff =
      (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / 86400000
    if (diff <= 2) tempStreak++
    else {
      maxStreak = Math.max(maxStreak, tempStreak)
      tempStreak = 1
    }
  }
  maxStreak = Math.max(maxStreak, tempStreak)

  return {
    totalSessions: logs.length,
    dateRange: {
      first: logs[logs.length - 1]?.createdAt || "",
      last: logs[0]?.createdAt || "",
    },
    types,
    monthly,
    streaks: { current: 0, max: maxStreak },
    recentSessions: logs.slice(0, 20).map((l) => ({
      date: l.createdAt,
      name: l.workoutName,
      notes: l.notes,
    })),
  }
}

export function useWorkoutStats() {
  const { data: logs, isLoading, error } = useWorkoutLogs()
  const data = useMemo(() => (logs ? computeWorkoutStats(logs) : undefined), [logs])
  return { data, isLoading, error: error as Error | null }
}

export interface DashboardData {
  user: { name: string; email: string } | null
  weightCount: number
  workoutCount: number
  latestWeight: { weight: string; date: string } | null
  latestWorkout: { name: string; date: string } | null
}

export function useDashboard() {
  const uq = useUser()
  const wq = useWeightLogs()
  const woq = useWorkoutLogs()
  const error = uq.error || wq.error || woq.error
  const isLoading = uq.isLoading || wq.isLoading || woq.isLoading

  const data = useMemo(() => {
    if (!uq.data || !wq.data || !woq.data) return undefined
    return {
      user: { name: uq.data.name, email: uq.data.email },
      weightCount: wq.data.length,
      workoutCount: woq.data.length,
      latestWeight: wq.data.length
        ? { weight: wq.data[wq.data.length - 1].weight, date: wq.data[wq.data.length - 1].createdAt }
        : null,
      latestWorkout: woq.data.length
        ? { name: woq.data[0].workoutName, date: woq.data[0].createdAt }
        : null,
    } satisfies DashboardData
  }, [uq.data, wq.data, woq.data])

  return { data, isLoading, error: error as Error | null }
}

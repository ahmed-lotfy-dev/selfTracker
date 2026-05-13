import { axiosInstance } from "./config"

export interface WeightLog {
  id: string
  userId: string
  weight: string
  energy: "Low" | "Okay" | "Good" | "Great" | null
  mood: "Low" | "Medium" | "High" | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export async function getWeightLogs(cursor?: string, limit = 500) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set("cursor", cursor)
  const res = await axiosInstance.get<{ logs: WeightLog[]; nextCursor: string | null }>(
    `/api/weightLogs?${params}`
  )
  return res.data
}

export async function getAllWeightLogs() {
  const all: WeightLog[] = []
  let cursor: string | undefined
  let pages = 0
  while (pages < 20) {
    const { logs, nextCursor } = await getWeightLogs(cursor, 500)
    all.push(...logs)
    if (!nextCursor) break
    cursor = nextCursor
    pages++
  }
  return all
}

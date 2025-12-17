import { backendUrl } from "@/lib/api"

export interface WeightLog {
  id: string
  userId: string
  weight: string
  mood: "Low" | "Medium" | "High"
  energy: "Low" | "Okay" | "Good" | "Great"
  notes?: string
  createdAt: string
}

export interface CreateWeightLogDTO {
  weight: number | string
  mood: "Low" | "Medium" | "High"
  energy: "Low" | "Okay" | "Good" | "Great"
  notes?: string
  createdAt?: string | Date
}

export async function getWeightLogs(cursor?: string, limit = 10): Promise<{ logs: WeightLog[], nextCursor?: string }> {
  const params = new URLSearchParams()
  if (cursor) params.append("cursor", cursor)
  params.append("limit", limit.toString())

  const res = await fetch(`${backendUrl}/api/weightLogs?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch weight logs")
  return res.json()
}

export async function createWeightLog(data: CreateWeightLogDTO): Promise<WeightLog> {
  const res = await fetch(`${backendUrl}/api/weightLogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create weight log")
  const json = await res.json()
  return json.weightLog
}

export async function deleteWeightLog(id: string): Promise<void> {
  const res = await fetch(`${backendUrl}/api/weightLogs/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete weight log")
}

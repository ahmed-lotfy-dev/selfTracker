import axiosInstance from "@/lib/api/axiosInstance"

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

  const res = await axiosInstance.get(`/weightLogs?${params.toString()}`)
  return res.data
}

export async function createWeightLog(data: CreateWeightLogDTO): Promise<WeightLog> {
  const res = await axiosInstance.post("/weightLogs", data)
  return res.data.weightLog
}

export async function deleteWeightLog(id: string): Promise<void> {
  await axiosInstance.delete(`/weightLogs/${id}`)
}

export interface WeightChartData {
  labels: string[]
  datasets: {
    data: number[] // This might need adjustment based on valid backend response
  }[]
}

export async function getWeightChart(month: number): Promise<WeightChartData> {
  const res = await axiosInstance.get(`/weightLogs/chart?month=${month}`)
  return res.data
}

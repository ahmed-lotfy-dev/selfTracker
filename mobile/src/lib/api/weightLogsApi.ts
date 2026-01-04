import axiosInstance from "./axiosInstance"
import { API_BASE_URL } from "./config"
import type { WeightLog } from "@/src/stores/useWeightStore"

type PaginatedResponse = {
  logs: WeightLog[]
  nextCursor: string | null
}

export const getWeightLogs = async (
  cursor?: string,
  limit: number = 20
): Promise<PaginatedResponse> => {
  const params = new URLSearchParams()
  if (cursor) params.append("cursor", cursor)
  params.append("limit", String(limit))

  const queryString = params.toString()
  const url = `${API_BASE_URL}/api/weightLogs${queryString ? `?${queryString}` : ""}`

  const response = await axiosInstance.get(url)

  return {
    logs: response.data.logs.map((log: any) => ({
      id: log.id,
      userId: log.userId,
      weight: log.weight,
      notes: log.notes,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt || log.createdAt,
      deletedAt: log.deletedAt || null,
    })),
    nextCursor: response.data.nextCursor,
  }
}

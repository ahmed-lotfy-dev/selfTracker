import { WeightLogType } from "@/src/types/weightLogType"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"

export const fetchAllWeightLogs = async (
  cursor: string | null,
  limit: number
) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/weightLogs`, {
      params: {
        cursor,
        limit,
      },
    })
    console.log(response.data.logs)
    return {
      logs: response.data.logs,
      nextCursor: response.data.nextCursor || null,
    }
  } catch (error) {
    console.error("Error fetching weight logs:", error)
    throw error
  }
}

export const fetchSingleWeightLog = async (weightId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/weightLogs/${weightId}`
  )
  return response.data.weightLog
}

export const createWeight = async (weight: WeightLogType) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/weightLogs`,
    weight
  )
  return response.data
}

export const updateWeight = async (weight: WeightLogType) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/api/weightLogs/${weight.id}`,
    weight
  )
  return response.data
}

export const deleteWeight = async (weightId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/weightLogs/${weightId}`
  )
  return response.data
}

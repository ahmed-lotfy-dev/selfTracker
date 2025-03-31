import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"

export const fetchAllWeightLogs = async (
  cursor: string | null = null,
  limit: number = 10
) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/weightLogs`, {
    params: {
      cursor,
      limit,
    },
  })
  return response.data
}

export const fetchSingleWeightLog = async (weightId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/weightLogs/${weightId}`
  )
  return response.data
}
export const createWeight = async (weight: any) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/weightLogs`,
    weight
  )
  return response.data
}

export const updateWeight = async (weight: any) => {
  const response = await axiosInstance.put(
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

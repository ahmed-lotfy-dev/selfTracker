import { WeightType } from "@/types/weightType"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"

export const fetchAllWeights = async (
  cursor: string | null = null,
  limit: number = 10
) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/weights`, {
    params: {
      cursor,
      limit,
    },
  })
  return response.data
}

export const fetchSingleWeightLog = async (weightId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/weights/${weightId}`
  )
  return response.data
}
export const createWeight = async (weight: WeightType) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/weights`,
    weight
  )
  return response.data
}

export const updateWeight = async (weight: WeightType) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/api/weights/${weight.id}`,
    weight
  )
  return response.data
}

export const deleteWeight = async (weightId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/weights/${weightId}`
  )
  return response.data
}

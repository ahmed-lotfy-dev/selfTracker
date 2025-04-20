import { WeightType } from "@/src/types/weightType"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"
import axios from "axios"
import { getAccessToken } from "../storage"

export const fetchAllWeightLogs = async (
  cursor: string | null = null,
  limit: number = 10
) => {
  const token = await getAccessToken()
  console.log(token)
  const response = await axiosInstance.get(`${API_BASE_URL}/api/weightLogs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      cursor,
      limit,
    },
  })
  console.log(response)
  return response.data
}

export const fetchSingleWeightLog = async (weightId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/weightLogs/${weightId}`
  )
  return response.data.weightLog
}
export const createWeight = async (weight: any) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/weightLogs`,
    weight
  )
  return response.data
}

export const updateWeight = async (weight: any) => {
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

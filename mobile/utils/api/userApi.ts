import { WeightType } from "@/types/weightType"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"

export const updateUser = async (user: any) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/api/users/${user.id}`,
    { ...user }
  )
  return response.data
}

export const deleteUser = async (weightId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/users/${weightId}`
  )
  return response.data
}

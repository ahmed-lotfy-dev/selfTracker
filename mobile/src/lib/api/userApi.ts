import axiosInstance from "./axiosInstance"
import { API_BASE_URL } from "./config"
import { User } from "@/src/types/userType"

export const fetchUserHomeInfo = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/users/home`)
  return response.data
}

export const updateUser = async (data: Partial<User> & { id?: string }) => {
  const response = await axiosInstance.patch(`${API_BASE_URL}/api/users/${data.id}`, data)
  return response.data
}

export const fetchGoals = async (userId?: string) => {
  if (!userId) return []
  const response = await axiosInstance.get(`${API_BASE_URL}/api/users/${userId}/goals`)
  return response.data.goals || []
}

export const createGoal = async (data: { userId: string; goalType: string; targetValue: string }) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/api/users/${data.userId}/goals`, data)
  return response.data
}

export const deleteGoal = async (goalId: string) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/api/users/goals/${goalId}`)
  return response.data
}

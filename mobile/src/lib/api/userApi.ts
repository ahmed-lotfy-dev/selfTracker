import { WeightLogType } from "@/src/types/weightLogType"
import { API_BASE_URL } from "./config"
import axios from "axios"
import axiosInstance from "./axiosInstane"

export const fetchUserHomeInfo = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/users/me/home`)
  return response.data
}

import { User } from "@/src/types/userType"

export const updateUser = async ({
  id,
  ...updatedFields
}: Partial<User> & { id: string }) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/api/users/${id}`,
    updatedFields
  )
  return response.data
}

export const deleteUser = async (weightId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/users/${weightId}`
  )
  return response.data
}

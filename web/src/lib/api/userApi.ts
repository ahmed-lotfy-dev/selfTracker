import { axiosInstance } from "./config"

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  image?: string
  gender?: string
  weight?: number
  height?: number
  unitSystem?: string
  theme?: string
  currency?: string
  income?: number
  dateOfBirth?: string
}

export async function getHome() {
  const res = await axiosInstance.get<User>("/api/users/me/home")
  return res.data
}

export async function updateUser(data: Record<string, any>) {
  const res = await axiosInstance.patch<User>(`/api/users/${data.id}`, data)
  return res.data
}

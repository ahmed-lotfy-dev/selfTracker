import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password,
  })
  return response.data
}
console.log(process.env.BACKEND_URL)
export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
    name,
    email,
    password,
  })
  return response.data
}

export const logout = async (refreshToken: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  )
  return response.data
}

export const userData = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/users/me`)
  return response.data
}

export const checkEmailVerification = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/users/check-verification`
  )
  return response.data
}

export const resendVerificationEmail = async () => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/users/resend-verification`
  )
  return response.data
}

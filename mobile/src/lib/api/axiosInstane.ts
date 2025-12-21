import axios from "axios"
import { router } from 'expo-router';
import { API_BASE_URL } from "./config"
import { authClient } from "../auth-client"
import { getAccessToken } from "../storage"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    // 1. Try Better Auth session
    const { data: session } = await authClient.getSession()
    let token = session?.session?.token

    // 2. Fallback to manually stored accessToken
    if (!token) {
      const manualToken = await getAccessToken()
      if (manualToken) {
        token = manualToken
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Axios 401 intercepted from:", error.config.url)
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

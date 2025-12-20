import axios from "axios"
import { router } from 'expo-router';
import { API_BASE_URL } from "./config"
import { authClient } from "../auth-client"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const cookies = authClient.getCookie()
    if (cookies) {
      config.headers.Cookie = cookies
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

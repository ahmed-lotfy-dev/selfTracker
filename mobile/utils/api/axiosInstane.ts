import axios from "axios"
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
  setRefreshToken,
} from "../storage"

import { API_BASE_URL } from "./config"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

axiosInstance.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await getRefreshToken()
        console.log("Refreshing token with:", refreshToken)

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        )

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data

        console.log("New Access Token Received:", accessToken)
        console.log("New Refresh Token Received:", newRefreshToken)

        if (!accessToken || !newRefreshToken) {
          console.error("Error: Tokens not received properly")
          return Promise.reject(new Error("Invalid refresh token response"))
        }

        await setAccessToken(accessToken)
        await setRefreshToken(newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.error("Refresh Token Error:", refreshError)
        await clearTokens()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

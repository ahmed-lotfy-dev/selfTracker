import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/"
    : "https://selftracker.ahmedlotfy.dev/"

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
})

const getAccessToken = async () => {
  return await AsyncStorage.getItem("accessToken")
}

// 🔥 Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 🔥 Response Interceptor: Handle 401 Errors and Refresh Token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 Unauthorized and it's NOT a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken")
        if (!refreshToken) {
          throw new Error("No refresh token found, logout required")
        }

        // 🔥 Request a new access token
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/auth/refresh-token`,
          { refreshToken }
        )
        const newAccessToken = refreshResponse.data.accessToken

        await AsyncStorage.setItem("accessToken", newAccessToken)

        // 🔥 Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest) 
      } catch (refreshError) {
        console.error("Refresh Token Error:", refreshError)
        return Promise.reject(refreshError) // Logout user if refresh fails
      }
    }

    return Promise.reject(error) 
  }
)

export default axiosInstance

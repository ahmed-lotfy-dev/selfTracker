import axios from "axios"
import { router } from 'expo-router';
import { API_BASE_URL } from "./config"
import * as SecureStore from "expo-secure-store"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    // Check both potential token keys
    let token = await SecureStore.getItemAsync("selftracker.session_token");
    if (!token) {
      token = await SecureStore.getItemAsync("selftracker.better-auth.session_token");
    }

    if (token) {
      // Send as both Bearer and Cookie for maximum compatibility
      config.headers.Authorization = `Bearer ${token}`
      config.headers.Cookie = `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`
      // console.log(`[Axios] 🔑 Authenticated Request to ${config.url}`)
    } else {
      console.warn(`[Axios] ⚠️ No token found for request to ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[Axios] ❌ Request Error:', error)
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    // console.log(`[Axios] ✅ Response form ${response.config.url}: ${response.status}`)
    return response
  },
  async (error) => {
    console.error(`[Axios] ❌ Response Error for ${error.config?.url}:`, error.message, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default axiosInstance

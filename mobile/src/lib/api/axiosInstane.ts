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
    // Get token from SecureStore (faster than authClient.getSession())
    const token = await SecureStore.getItemAsync("selftracker.better-auth.session_token");

    if (token) {
      // Send as both Bearer (for non-better-auth endpoints) and Cookie (for better-auth)
      config.headers.Authorization = `Bearer ${token}`
      config.headers.Cookie = `__Secure-better-auth.session_token=${token}`
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
    return Promise.reject(error)
  }
)

export default axiosInstance

import axios from "axios"
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
  setRefreshToken,
} from "../storage"

import { API_BASE_URL } from "./config"
import { authClient } from "../auth-client"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const cookie = authClient.getCookie()
    const token = await getAccessToken()

    if (cookie) {
      config.headers.Cookie = cookie
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

export default axiosInstance

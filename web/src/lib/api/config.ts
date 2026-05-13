import axios from "axios"

const TOKEN_KEY = "selftracker.session_token"

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://selftracker.ahmedlotfy.site"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

axiosInstance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = []

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return axiosInstance(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const sessionRes = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!sessionRes.ok) throw new Error("Session expired")
        const session = await sessionRes.json()
        const newToken = session.session?.token || getToken()
        setToken(newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(original)
      } catch {
        clearToken()
        processQueue(err, null)
        window.location.href = "/#/sign-in"
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

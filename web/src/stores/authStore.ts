import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getToken, setToken, clearToken } from "../lib/api/config"
import type { User } from "../lib/api/userApi"

interface AuthState {
  user: User | null
  hasHydrated: boolean
  setUser: (user: User | null) => void
  loginWithToken: (token: string) => Promise<void>
  logout: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      loginWithToken: async (token: string) => {
        setToken(token)
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL || "https://selftracker.ahmedlotfy.site"}/api/auth/get-session`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (res.ok) {
            const data = await res.json()
            set({ user: data.user })
          }
        } catch {
          clearToken()
        }
      },
      logout: () => {
        clearToken()
        set({ user: null })
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "selftracker-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export function useIsAuthenticated() {
  return useAuthStore((s) => !!s.user)
}

export function useUser() {
  return useAuthStore((s) => s.user)
}

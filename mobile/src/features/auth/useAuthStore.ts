import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { secureStorage } from "@/src/lib/storage"
import { API_BASE_URL } from "@/src/lib/api/config"
import * as SecureStore from "expo-secure-store"

type AuthState = {
  user: any | null
  token: string | null
  hasHydrated: boolean
}

type AuthActions = {
  setUser: (user: any) => void
  setToken: (token: string | null) => void
  setHasHydrated: (hydrated: boolean) => void
  loginWithToken: (token: string) => Promise<boolean>
  logout: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ... state
      user: null,
      token: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      loginWithToken: async (token: string) => {
        try {
          // 1. Optimistic Update (Critical for immediate WS connection)
          set({ token })

          // 2. Persist legacy keys
          await SecureStore.setItemAsync("selftracker.better-auth.session_token", token);
          await SecureStore.setItemAsync("selftracker.session_token", token);

          // 3. Verify Session
          const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
            headers: {
              'Cookie': `__Secure-better-auth.session_token=${token}`
            },
          });

          if (!response.ok) throw new Error("Session fetch failed")

          const data = await response.json()
          if (data?.user) {
            set({ user: data.user })
            return true
          }
          return false
        } catch (error) {
          console.error("LoginWithToken Failed:", error)
          set({ token: null, user: null }) // Rollback
          return false
        }
      },

      logout: () => {
        set({ user: null, token: null })
        SecureStore.deleteItemAsync("selftracker.better-auth.session_token")
        SecureStore.deleteItemAsync("selftracker.session_token")
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export const useUser = () => useAuthStore((state) => state.user)
export const useToken = () => useAuthStore((state) => state.token)
export const useHasHydrated = () => useAuthStore((state) => state.hasHydrated)

export const useAuthActions = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)
  const loginWithToken = useAuthStore((state) => state.loginWithToken)
  const logout = useAuthStore((state) => state.logout)
  return { setUser, setToken, loginWithToken, logout }
}

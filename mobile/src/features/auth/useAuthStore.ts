import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { API_BASE_URL } from "@/src/lib/api/config"
import * as SecureStore from "expo-secure-store"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Uniwind } from 'uniwind'
import { queryClient } from "@/src/lib/react-query"

type AuthState = {
  user: any | null
  token: string | null
  hasHydrated: boolean
  isLoading: boolean
}

type AuthActions = {
  setUser: (user: any) => void
  setToken: (token: string | null) => void
  setHasHydrated: (hydrated: boolean) => void
  setIsLoading: (loading: boolean) => void
  loginWithToken: (token: string) => Promise<boolean>
  logout: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      hasHydrated: false,
      isLoading: true,

      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      loginWithToken: async (token: string) => {
        try {
          console.log('[AUTH_STORE] loginWithToken called with token:', token?.substring(0, 10) + '...')
          // Save to SecureStore - Use consistent keys
          await SecureStore.setItemAsync("selftracker.session_token", token);
          console.log('[AUTH_STORE] Token saved to SecureStore (key: selftracker.session_token)')

          // Verify Session
          console.log('[AUTH_STORE] Fetching session from:', `${API_BASE_URL}/api/auth/get-session`)
          const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
            headers: {
              'Cookie': `__Secure-better-auth.session_token=${token}`
            },
          });
          console.log('[AUTH_STORE] Session response status:', response.status)

          if (!response.ok) throw new Error("Session fetch failed")

          const data = await response.json()
          console.log('[AUTH_STORE] Session data received:', JSON.stringify(data))
          console.log('[AUTH_STORE] Has user?', !!data?.user)

          if (data?.user) {
            console.log('[AUTH_STORE] Setting user state:', JSON.stringify(data.user))
            set({ user: data.user, token, isLoading: false })

            // Sync theme
            const theme = data.user?.theme ?? 'system'
            Uniwind.setTheme(theme)

            return true
          }
          set({ isLoading: false })
          return false
        } catch (error) {
          console.error("LoginWithToken Failed:", error)
          set({ user: null, token: null, isLoading: false })
          await SecureStore.deleteItemAsync("selftracker.better-auth.session_token")
          await SecureStore.deleteItemAsync("selftracker.session_token")
          return false
        }
      },

      logout: async () => {
        // Clear React Query cache
        queryClient.clear()

        // Clear auth state
        set({ user: null, token: null })

        // Clear SecureStore
        await SecureStore.deleteItemAsync("selftracker.better-auth.session_token")
        await SecureStore.deleteItemAsync("selftracker.session_token")
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user, not token
      onRehydrateStorage: () => async (state) => {
        if (!state) return
        console.log('[AUTH_STORE] Rehydrating storage...')

        // Load token from SecureStore after hydration
        try {
          // Check both variants just in case
          let storedToken = await SecureStore.getItemAsync("selftracker.session_token")
          if (!storedToken) {
            storedToken = await SecureStore.getItemAsync("selftracker.better-auth.session_token")
          }

          console.log('[AUTH_STORE] Stored token found?', !!storedToken)

          if (storedToken && state.user) {
            console.log('[AUTH_STORE] Rehydrating with user and token')
            state.setToken(storedToken)
            state.setIsLoading(false)

            // Sync theme
            const theme = state.user?.theme ?? 'system'
            Uniwind.setTheme(theme)
          } else {
            console.log('[AUTH_STORE] Rehydration complete, no valid session found (user:', !!state.user, 'token:', !!storedToken, ')')
            state.setIsLoading(false)
          }
        } catch (error) {
          console.error("[AUTH_STORE] Token rehydration failed:", error)
          state.setToken(null)
          state.setIsLoading(false)
        }

        // Mark as hydrated
        state.setHasHydrated(true)
        console.log('[AUTH_STORE] Storage hydration complete')
      },
    }
  )
)

// Selectors
export const useUser = () => useAuthStore((state) => state.user)
export const useToken = () => useAuthStore((state) => state.token)
export const useHasHydrated = () => useAuthStore((state) => state.hasHydrated)
export const useIsLoading = () => useAuthStore((state) => state.isLoading)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user && !!state.token)

// Consolidated auth hook - single source of truth
export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => !!state.user && !!state.token)

  return {
    user,
    token,
    storeId: user?.id ?? 'anonymous',
    isAuthenticated,
    isLoading,
  }
}

// Actions hook
export const useAuthActions = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const loginWithToken = useAuthStore((state) => state.loginWithToken)
  const logout = useAuthStore((state) => state.logout)
  return { setUser, loginWithToken, logout }
}

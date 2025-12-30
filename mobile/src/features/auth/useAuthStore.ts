import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { API_BASE_URL } from "@/src/lib/api/config"
import * as SecureStore from "expo-secure-store"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Uniwind } from 'uniwind'

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
          // Save to SecureStore
          await SecureStore.setItemAsync("selftracker.session_token", token);

          // Verify Session
          const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
            headers: {
              'Cookie': `__Secure-better-auth.session_token=${token}`
            },
          });

          if (!response.ok) throw new Error("Session fetch failed");

          const data = await response.json();

          if (data?.user) {
            set({ user: data.user, token, isLoading: false });

            // Sync theme
            const theme = data.user?.theme ?? 'system';
            Uniwind.setTheme(theme);

            return true;
          } else {
            // OAuth tokens may not have backend session - accept for basic auth
            set({ user: null, token, isLoading: false });
            return false;
          }
        } catch (error) {
          console.error("❌ LoginWithToken Failed:", error);
          set({ user: null, token: null, isLoading: false });
          await SecureStore.deleteItemAsync("selftracker.better-auth.session_token");
          await SecureStore.deleteItemAsync("selftracker.session_token");
          return false;
        }
      },

      logout: async () => {
        // Clear auth state
        set({ user: null, token: null })

        // Clear SecureStore
        await SecureStore.deleteItemAsync("selftracker.better-auth.session_token")
        await SecureStore.deleteItemAsync("selftracker.session_token")

        // Clear all Zustand stores
        try {
          const { useTasksStore } = await import('@/src/stores/useTasksStore')
          const { useHabitsStore } = await import('@/src/stores/useHabitsStore')
          const { useWorkoutsStore } = await import('@/src/stores/useWorkoutsStore')
          const { useWeightStore } = await import('@/src/stores/useWeightStore')
          const { useNutritionStore } = await import('@/src/stores/useNutritionStore')

          useTasksStore.setState({ tasks: [] })
          useHabitsStore.setState({ habits: [] })
          useWorkoutsStore.setState({ workouts: [], workoutLogs: [] })
          useWeightStore.setState({ weightLogs: [] })
          useNutritionStore.setState({ foodLogs: [], goals: null })

          // Clear SQLite database
          const { SyncManager } = await import('@/src/services/SyncManager')
          await SyncManager.clearDatabase()

          console.log('[AUTH] ✅ All local data cleared on logout')
        } catch (e) {
          console.error('[AUTH] Failed to clear stores:', e)
        }
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user, not token
      onRehydrateStorage: () => async (state) => {
        if (!state) return

        // Load token from SecureStore after hydration
        try {
          // Check both variants just in case
          let storedToken = await SecureStore.getItemAsync("selftracker.session_token")
          if (!storedToken) {
            storedToken = await SecureStore.getItemAsync("selftracker.better-auth.session_token")
          }


          if (storedToken && state.user) {
            state.setToken(storedToken)
            state.setIsLoading(false)

            // Sync theme
            const theme = state.user?.theme ?? 'system'
            Uniwind.setTheme(theme)
          } else {
            state.setIsLoading(false)
          }
        } catch (error) {
          console.error("[AUTH_STORE] Token rehydration failed:", error)
          state.setToken(null)
          state.setIsLoading(false)
        }

        // Mark as hydrated
        state.setHasHydrated(true)
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
  const logout = useAuthStore((state) => state.logout)
  const isAuthenticated = useAuthStore((state) => !!state.user && !!state.token)

  return {
    user,
    token,
    storeId: user?.id ?? 'anonymous',
    isAuthenticated,
    isLoading,
    logout,
  }
}

// Actions hook
export const useAuthActions = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const loginWithToken = useAuthStore((state) => state.loginWithToken)
  const logout = useAuthStore((state) => state.logout)
  return { setUser, loginWithToken, logout }
}

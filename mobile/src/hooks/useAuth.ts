import { useEffect } from "react"
import { useAuthActions, useUser, useToken, useHasHydrated } from "@/src/features/auth/useAuthStore"
import { clearAllUserData } from "@/src/lib/storage"
import { queryClient } from "@/src/lib/react-query"
import { Uniwind } from 'uniwind'

export const useAuth = () => {
  // Single source of truth: Zustand store
  const user = useUser()
  const token = useToken()
  const hasHydrated = useHasHydrated()
  const { logout: storeLogout } = useAuthActions()

  // Sync Theme
  useEffect(() => {
    const theme = (user as any)?.theme ?? 'system'
    Uniwind.setTheme(theme)
  }, [(user as any)?.theme])

  // Simplified loading: only wait for hydration
  const isLoading = !hasHydrated

  const logout = async () => {
    await clearAllUserData()
    queryClient.removeQueries()
    storeLogout()
  }

  return {
    user,
    token,
    storeId: user?.id ?? 'anonymous',

    // Auth Status
    isAuthenticated: !!user && !!token,
    isLoading,

    logout,
  }
}

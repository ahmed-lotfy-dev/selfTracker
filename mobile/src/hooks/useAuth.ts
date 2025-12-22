import { useState, useEffect } from "react"
import { authClient } from "@/src/lib/auth-client"
import { useAuthActions, useUser, useToken, useHasHydrated } from "../store/useAuthStore"
import { getAccessToken, clearAllUserData } from "@/src/lib/storage"
import { queryClient } from "@/src/lib/react-query"
import { Uniwind } from 'uniwind'

export const useAuth = () => {
  // 1. Better Auth Hook
  const { data: sessionData, isPending: isSessionPending, error, refetch } = authClient.useSession()

  // 2. Zustand State
  const user = useUser()
  const token = useToken()
  const hasHydrated = useHasHydrated()
  const { setUser, setToken } = useAuthActions()

  // 3. Manual Token Flow (Stability ensure)
  const [isManualCheckDone, setIsManualCheckDone] = useState(false)

  // Sync token from SecureStore to Zustand on mount or when user changes
  useEffect(() => {
    getAccessToken().then(storedToken => {
      if (storedToken && storedToken !== token) {
        setToken(storedToken)
      }
      setIsManualCheckDone(true)
    })
  }, [user]) // Re-run when user changes to catch social login redirect

  // Derived State
  const finalUser = sessionData?.user ?? user ?? null
  const finalToken = sessionData?.session?.token ?? token ?? null
  const storeId = finalUser?.id ?? 'anonymous'

  // 4. Sync Theme
  useEffect(() => {
    const theme = (sessionData?.user as any)?.theme ?? (user as any)?.theme ?? 'system'
    Uniwind.setTheme(theme)
  }, [(sessionData?.user as any)?.theme, (user as any)?.theme])

  // Loading Logic
  // Wait for: Hydration AND (Session Fetch OR Error) AND initial token load
  const isLoading = !hasHydrated || isSessionPending || !isManualCheckDone

  const logout = async () => {
    try {
      await clearAllUserData()
      queryClient.removeQueries()
      await authClient.signOut()
    } finally {
      setUser(null)
      setToken(null)
      refetch()
    }
  }

  return {
    user: finalUser,
    token: finalToken, // Used for LiveStore and headers
    storeId,           // Used for LiveStore identity

    // Auth Status
    isAuthenticated: !!finalUser && !!finalToken, // Strict check
    isLoading,
    isResolved: !isLoading && !!finalUser, // Helper

    error,
    refetch,
    logout,
  }
}

import { useState, useEffect } from "react"
import { authClient } from "@/src/lib/auth-client"
import { useAuthActions, useUser, useHasHydrated } from "../store/useAuthStore"
import { getAccessToken, clearAllUserData } from "@/src/lib/storage"
import { queryClient } from "@/src/lib/react-query"
import { Uniwind } from 'uniwind'

export const useAuth = () => {
  // 1. Better Auth Hook
  const { data: sessionData, isPending: isSessionPending, error, refetch } = authClient.useSession()

  // 2. Zustand State
  const user = useUser()
  const hasHydrated = useHasHydrated()
  const { setUser } = useAuthActions()

  // 3. Manual Token State (Fallback)
  const [manualToken, setManualToken] = useState<string | null>(null)
  const [isManualCheckDone, setIsManualCheckDone] = useState(false)

  // Fetch Manual Token on Mount
  useEffect(() => {
    getAccessToken().then(token => {
      setManualToken(token)
      setIsManualCheckDone(true)
    })
  }, [])

  // 4. Sync Theme
  useEffect(() => {
    const theme = (sessionData?.user as any)?.theme ?? (user as any)?.theme ?? 'system'
    Uniwind.setTheme(theme)
  }, [(sessionData?.user as any)?.theme, (user as any)?.theme])

  // Derived State
  const finalUser = sessionData?.user ?? user ?? null
  const finalToken = sessionData?.session?.token ?? manualToken ?? null
  const storeId = finalUser?.id ?? 'anonymous'

  // Loading Logic
  // We wait for: Zustand Hydration AND (Session Fetch OR Error) AND Manual Token Check
  const isLoading = !hasHydrated || isSessionPending || !isManualCheckDone

  const logout = async () => {
    try {
      await clearAllUserData()
      queryClient.removeQueries()
      await authClient.signOut()
    } finally {
      setUser(null)
      setManualToken(null)
      refetch()
    }
  }

  return {
    user: finalUser,
    token: finalToken, // Used for LiveStore and headers
    storeId,           // Used for LiveStore identity

    // Auth Status
    isAuthenticated: !!finalUser && !!finalToken,
    isLoading,
    isResolved: !isLoading && !!finalUser, // Helper

    error,
    refetch,
    logout,
  }
}

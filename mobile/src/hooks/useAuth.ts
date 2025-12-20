import { useEffect } from "react"
import { authClient } from "@/src/lib/auth-client"
import { useAuthActions, useUser } from "../store/useAuthStore"
import { clearAllUserData } from "@/src/lib/storage"
import { queryClient } from "@/src/components/Provider/AppProviders"
import { dbManager } from "@/src/db/client"
import { initialSync } from "@/src/services/sync"

export const useAuth = () => {
  const { data: session, error, isPending, refetch } = authClient.useSession()
  const user = useUser()
  const { setUser } = useAuthActions()

  useEffect(() => {
    const initializeUserDatabase = async () => {
      if (session?.user?.id) {
        try {
          await dbManager.initializeUserDatabase(session.user.id)
          console.log(`[Auth] Database initialized for user: ${session.user.id}`)

          setUser(session.user)

          initialSync().then(result => {
            if (result.success) {
              console.log(`[Auth] Initial sync completed: ${result.synced} records`)
            } else {
              console.warn(`[Auth] Initial sync failed - app will work offline`)
            }
          }).catch(err => {
            console.warn(`[Auth] Initial sync error (non-blocking):`, err.message)
          })
        } catch (error) {
          console.error("[Auth] Failed to initialize user database:", error)
        }
      }
    }

    initializeUserDatabase()
  }, [session?.user, setUser])

  const logout = async () => {
    try {
      dbManager.closeCurrentDatabase()
      console.log("[Auth] Database closed for current user")

      await clearAllUserData()
      queryClient.removeQueries()
      await authClient.signOut()
    } finally {
      setUser(null)
      refetch()
    }
  }

  return {
    user: user ?? session?.user ?? null,
    session: session?.session ?? null,
    isAuthenticated: !!(user ?? session?.user),
    isResolved: !isPending && session !== undefined,
    isLoading: isPending,
    error,
    refetch,
    logout,
  }
}

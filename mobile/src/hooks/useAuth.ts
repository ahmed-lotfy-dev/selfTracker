import { authClient } from "@/src/lib/auth-client"
import { useAuthActions, useUser } from "../store/useAuthStore"
import { clearAllUserData } from "@/src/lib/storage"
import { queryClient } from "@/src/components/Provider/AppProviders"
import { dbManager } from "@/src/db/client"
import { clearUserSyncState } from "@/src/services/sync"

export const useAuth = () => {
  const { data: session, error, isPending, refetch } = authClient.useSession()
  const user = useUser()
  const { setUser } = useAuthActions()

  const logout = async () => {
    try {
      await clearUserSyncState().catch(err => console.warn("Failed to clear sync state", err))

      dbManager.closeCurrentDatabase()

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

import { useCallback, useEffect, useState } from "react"
import { authClient } from "@/src/lib/auth-client"
import { useAuthActions, useUser } from "../store/useAuthStore"

export const useAuth = () => {
  const { data: session, error, isPending, refetch } = authClient.useSession()
  const user = useUser()
  const { setUser } = useAuthActions()

  useEffect(() => {
    if (session?.user) {
      setUser(session.user)
    }
  }, [session?.user, setUser, user])

  const logout = async () => {
    await authClient.signOut()
    refetch()
    setUser(null)
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

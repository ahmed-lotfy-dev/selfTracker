import { useCallback, useEffect, useState } from "react"
import { authClient } from "@/src/utils/auth-client"
import { useAuthActions, useUser } from "../store/useAuthStore"

export const useAuth = () => {
  const { data: session, error, isPending, refetch } = authClient.useSession()
  const session2 = authClient.getSession()
  console.log(session2)
  const user = useUser()
  const { setUser } = useAuthActions()
  console.log({ session, user })
  useEffect(() => {
    if (session?.user) {
      setUser(session.user)
    }
  }, [session?.user, setUser])

  const logout = async () => {
    await authClient.signOut()
    refetch()
    setUser(null)
  }

  return {
    user: user ?? session?.user ?? null,
    session: session?.session ?? null,
    isAuthenticated: !!user,
    isResolved: !isPending && session?.user !== undefined,
    isLoading: isPending,
    error,
    refetch,
    logout,
  }
}

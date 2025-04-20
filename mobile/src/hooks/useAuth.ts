import { useCallback, useEffect, useState } from "react"
import { authClient } from "@/src/utils/auth-client"
import { useAuthActions, useUser } from "../store/useAuthStore"

export const useAuth = () => {
  const { data, error, isPending, refetch } = authClient.useSession()
  const user = useUser()
  const { setUser } = useAuthActions()

  useEffect(() => {
    if (data?.user) {
      setUser(data.user)
    }
  }, [data?.user, setUser])

  console.log({ "from inside useAuth": user })

  const logout = async () => {
    await authClient.signOut()
    refetch()
    setUser(null)
  }

  return {
    user: user ?? data?.user ?? null,
    session: data?.session ?? null,
    isAuthenticated: !!user,
    isResolved: !isPending && data?.user !== undefined,
    isLoading: isPending,
    error,
    refetch,
    logout,
  }
}

import { useCallback, useEffect, useState } from "react"
import { authClient } from "@/src/utils/auth-client"

export const useAuth = () => {
  const { data, error, isPending, refetch } = authClient.useSession()

  const logout = useCallback(async () => {
    await authClient.signOut()
    refetch()
  }, [refetch])

  return {
    user: data?.user || null,
    session: data?.session || null,
    isAuthenticated: !!data?.user,
    isLoading: isPending,
    error,
    refetch,
    logout,
  }
}

import { useEffect } from 'react'
import { useAuthStore } from '@/src/features/auth/useAuthStore'
import { authClient } from '@/src/lib/auth-client'
import { useSyncStore } from '@/src/stores/useSyncStore'

const TOKEN_REFRESH_INTERVAL = 6 * 24 * 60 * 60 * 1000 // 6 days in ms
const SESSION_CHECK_INTERVAL = 60 * 60 * 1000 // 1 hour in ms

export function useTokenRefresh() {
  const token = useAuthStore((s) => s.token)
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    if (!token) return

    // Periodic session check — refresh token before it expires
    const interval = setInterval(async () => {
      try {
        const { data: session, error } = await authClient.getSession()
        
        if (error || !session?.user) {
          console.warn('[TokenRefresh] Session invalid, user needs to log in again')
          useSyncStore.getState().setTableStatus('weight_logs', 'auth_required')
          useSyncStore.getState().setTableStatus('workout_logs', 'auth_required')
          return
        }

        // Update token if it changed
        const newToken = session.session?.token
        if (newToken && newToken !== token) {
          console.log('[TokenRefresh] Token refreshed')
          setToken(newToken)
        }

        // Update user data
        setUser(session.user)
      } catch (err) {
        console.error('[TokenRefresh] Session check failed:', err)
      }
    }, SESSION_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [token, setToken, setUser])
}

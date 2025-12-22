import { useEffect, useState } from "react"
import { useOnboardingStore } from "../store/useOnboardingStore"
import { useAuthStore } from "../store/useAuthStore"
import { useAuth } from "./useAuth"

type AppInitState = {
  isReady: boolean
  initialRoute: string | null
}

export function useAppInitialization(): AppInitState {
  const { isOnboarding, hasHydrated: onboardingHydrated } = useOnboardingStore()
  const { user, hasHydrated: authHydrated } = useAuthStore()
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()

  const [targetRoute, setTargetRoute] = useState<string | null>(null)

  useEffect(() => {
    // Wait for all stores to rehydrate and initial auth check to complete
    if (!onboardingHydrated || !authHydrated || isAuthLoading) {
      return
    }

    // Determine the target route based on state priority
    let route = "/home"

    if (isOnboarding) {
      route = "/onboarding"
    } else if (!isAuthenticated) {
      route = "/sign-in"
    } else if (user && !user.emailVerified) {
      route = "/(auth)/verify-email"
    }

    setTargetRoute(route)
  }, [onboardingHydrated, authHydrated, isAuthLoading, isOnboarding, isAuthenticated, user])

  return {
    isReady: targetRoute !== null,
    initialRoute: targetRoute,
  }
}

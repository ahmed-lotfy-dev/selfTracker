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
      console.log("[AppInit] Onboarding needed")
      route = "/onboarding"
    } else if (!isAuthenticated) {
      console.log(`[AppInit] Not Authenticated. User: ${!!user}, IsAuth: ${isAuthenticated}`)
      route = "/sign-in"
    } else if (user && !user.emailVerified) {
      console.log("[AppInit] Email Not Verified")
      route = "/(auth)/verify-email"
    }

    if (route !== targetRoute) {
      console.log(`[AppInit] Redirecting to ${route}`)
    }
    setTargetRoute(route)
  }, [onboardingHydrated, authHydrated, isAuthLoading, isOnboarding, isAuthenticated, user])

  return {
    isReady: targetRoute !== null,
    initialRoute: targetRoute,
  }
}

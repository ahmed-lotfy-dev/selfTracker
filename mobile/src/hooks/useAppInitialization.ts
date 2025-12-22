import { useEffect, useState } from "react"
import { useOnboardingStore } from "@/src/features/onboarding/useOnboardingStore"
import { useAuthStore } from "@/src/features/auth/useAuthStore"

type AppInitState = {
  isReady: boolean
  initialRoute: string | null
}

export function useAppInitialization(): AppInitState {
  const { isOnboarding, hasHydrated: onboardingHydrated } = useOnboardingStore()
  const { user, token: authToken, hasHydrated: authHydrated } = useAuthStore()

  const [targetRoute, setTargetRoute] = useState<string | null>(null)

  useEffect(() => {
    // Wait for stores to rehydrate
    if (!onboardingHydrated || !authHydrated) {
      return
    }

    // Determine the target route based on state priority
    let route = "/home"

    const isAuthenticated = !!user && !!authToken

    if (isOnboarding) {
      route = "/onboarding"
    } else if (!isAuthenticated) {
      route = "/sign-in"
    } else if (user && !user.emailVerified) {
      route = "/(auth)/verify-email"
    }

    setTargetRoute(route)
  }, [onboardingHydrated, authHydrated, isOnboarding, user, authToken])

  return {
    isReady: targetRoute !== null,
    initialRoute: targetRoute,
  }
}

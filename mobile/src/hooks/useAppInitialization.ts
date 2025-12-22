import { useEffect, useState } from "react"
import { useOnboardingStore } from "@/src/features/onboarding/useOnboardingStore"
import { useAuthStore } from "@/src/features/auth/useAuthStore"

type AppInitState = {
  isReady: boolean
}

export function useAppInitialization(): AppInitState {
  const { hasHydrated: onboardingHydrated } = useOnboardingStore()
  const { hasHydrated: authHydrated } = useAuthStore()

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (onboardingHydrated && authHydrated && !isReady) {
      setIsReady(true)
    }
  }, [onboardingHydrated, authHydrated, isReady])

  return {
    isReady,
  }
}

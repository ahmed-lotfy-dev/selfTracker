import React from "react"
import { Redirect } from "expo-router"
import { useAppInitialization } from "../hooks/useAppInitialization"
import { useOnboardingStore } from "@/src/features/onboarding/useOnboardingStore"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { LoadingScreen } from "../components/LoadingScreen"

export default function Index() {
  const { isReady } = useAppInitialization()
  const { isOnboarding } = useOnboardingStore()
  const { isAuthenticated, user, token } = useAuth()

  console.log('[INDEX] isReady:', isReady)
  console.log('[INDEX] isOnboarding:', isOnboarding)
  console.log('[INDEX] isAuthenticated:', isAuthenticated)
  console.log('[INDEX] token:', token)  // ← Check if token is null
  console.log('[INDEX] user:', user)
  console.log('[INDEX] user?.emailVerified:', user?.emailVerified)

  if (!isReady) {
    return <LoadingScreen />
  }

  if (isOnboarding) {
    console.log('[INDEX] Redirecting to /onboarding')
    return <Redirect href="/onboarding" />
  }

  if (!isAuthenticated) {
    console.log('[INDEX] Redirecting to /sign-in')
    return <Redirect href="/sign-in" />
  }

  if (!user?.emailVerified) {
    console.log('[INDEX] Redirecting to /verify-email')
    return <Redirect href="/verify-email" />
  }

  console.log('[INDEX] Redirecting to /home')
  return <Redirect href="/home" />
}

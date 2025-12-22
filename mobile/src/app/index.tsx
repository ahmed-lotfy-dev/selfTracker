import React from "react"
import { Redirect } from "expo-router"
import { useAppInitialization } from "../hooks/useAppInitialization"
import { useOnboardingStore } from "@/src/features/onboarding/useOnboardingStore"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { LoadingScreen } from "../components/LoadingScreen"
import * as Linking from 'expo-linking'

export default function Index() {
  const url = Linking.useURL()
  const { isReady } = useAppInitialization()
  const { isOnboarding } = useOnboardingStore()
  const { isAuthenticated, user, token } = useAuth()

  console.log('[INDEX] isReady:', isReady)
  console.log('[INDEX] Incoming URL (useURL):', url)
  console.log('[INDEX] isOnboarding:', isOnboarding)
  console.log('[INDEX] isAuthenticated:', isAuthenticated)
  console.log('[INDEX] token:', token)
  console.log('[INDEX] user:', user)
  console.log('[INDEX] user?.emailVerified:', user?.emailVerified)

  React.useEffect(() => {
    Linking.getInitialURL().then(initialUrl => {
      console.log('[INDEX] Initial URL (getInitialURL):', initialUrl)
    })
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  if (isOnboarding) {
    console.log('[INDEX] Redirecting to /onboarding')
    return <Redirect href="/onboarding" />
  }

  // Hold on redirects if we are in the middle of a deep link return
  // or if rehydration hasn't settled yet
  if (!isAuthenticated && (url?.includes('callback') || !isReady)) {
    console.log('[INDEX] Holding for deep link or hydration...')
    return <LoadingScreen />
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

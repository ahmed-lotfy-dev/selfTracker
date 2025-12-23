import React from "react"
import { Redirect } from "expo-router"
import { useAppInitialization } from "../hooks/useAppInitialization"
import { useOnboardingStore } from "@/src/features/onboarding/useOnboardingStore"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { LoadingScreen } from "../components/LoadingScreen"
import * as Linking from 'expo-linking'
import { authClient } from "../lib/auth-client"
import { router } from "expo-router"

export default function Index() {
  const url = Linking.useURL()
  const { isReady } = useAppInitialization()
  const { isOnboarding } = useOnboardingStore()
  const { isAuthenticated, user, token } = useAuth()


  React.useEffect(() => {
    const processUrl = async (url: string | null) => {
      if (!url) return;

      const isAuthUrl = url.includes('callback') || url.includes('token=') || url.includes('error=') || url.includes('state=');


      if (isAuthUrl) {
        try {
          const result = await (authClient as any).handleRedirect?.(url);
        } catch (err) {
          console.error('[INDEX] handleRedirect Error:', err);
        }

        router.push('/callback');
      }
    };

    Linking.getInitialURL().then(processUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      processUrl(event.url);
    });

    return () => {
      subscription.remove()
    }
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  if (isOnboarding) {
    return <Redirect href="/onboarding" />
  }

  // Hold on redirects if we are in the middle of a deep link return
  // or if rehydration hasn't settled yet
  if (!isAuthenticated && (url?.includes('callback') || !isReady)) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />
  }

  if (!user?.emailVerified) {
    return <Redirect href="/verify-email" />
  }

  return <Redirect href="/home" />
}

import { StyleSheet, Text, View, Button } from "react-native"
import React, { useEffect } from "react"
import { Redirect } from "expo-router"
import { useOnboardingStore } from "../store/useOnboardingStore"
import { useAuthStore } from "../store/useAuthStore"

export default function Index() {
  const { isOnboarding, hasHydrated: onboardingHasHydrated } =
    useOnboardingStore()
  const { user, hasHydrated: authHasHydrated } = useAuthStore()

  useEffect(() => {
    console.log("Onboarding State:", isOnboarding)
    console.log("Onboarding Store Hydrated:", onboardingHasHydrated)
    console.log("Auth Store Hydrated:", authHasHydrated)
    console.log("User:", user)
  }, [isOnboarding, onboardingHasHydrated, authHasHydrated, user])

  if (!onboardingHasHydrated || !authHasHydrated) {
    return (
      <View style={styles.container}>
        <Text>Loading app...</Text>
      </View>
    )
  }

  if (isOnboarding) {
    return <Redirect href="/onboarding" />
  }

  if (!user) {
    return <Redirect href="/sign-in" />
  }

  if (user && !user.emailVerified) {
    return <Redirect href="/(auth)/verify-email" />
  }

  // ✅ If user is logged in & verified, show this index screen (not redirect)
  return <Redirect href="/(home)/home" />

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

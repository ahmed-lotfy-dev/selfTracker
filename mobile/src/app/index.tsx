import { StyleSheet, Text, View, Button } from "react-native"
import React, { useEffect } from "react"
import { useRouter } from "expo-router"
import { useOnboardingStore } from "../store/useOnboardingStore"
import { useAuthStore } from "../store/useAuthStore"

export default function Index() {
  const { isOnboarding, hasHydrated: onboardingHasHydrated } =
    useOnboardingStore()
  const { user, hasHydrated: authHasHydrated } = useAuthStore()
  const router = useRouter()

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
    router.replace("/onboarding")
    return null
  }

  if (!user) {
    router.replace("/(auth)/sign-in")
    return null
  }

  if (user && !user.emailVerified) {
    router.replace("/(auth)/verify-email")
    return null
  }

  // ✅ If user is logged in & verified, show this index screen (not redirect)
  return router.replace("/(home)/home")

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

import { StyleSheet, Text, View } from "react-native"
import React, { useEffect } from "react"
import { Redirect } from "expo-router"
import { useOnboardingStore } from "../store/useOnboardingStore"
import { useAuthStore } from "../store/useAuthStore"

export default function index() {
  const { isOnboarding, hasHydrated: onboardingHasHydrated } = useOnboardingStore()
  const { user, hasHydrated: authHasHydrated } = useAuthStore()

  useEffect(() => {
    console.log("Onboarding State:", isOnboarding)
    console.log("Onboarding Store Hydrated:", onboardingHasHydrated)
    console.log("Auth Store Hydrated:", authHasHydrated)
    console.log("User:", user)
  }, [isOnboarding, onboardingHasHydrated, authHasHydrated, user])

  if (!onboardingHasHydrated || !authHasHydrated) {
    // Show a loading indicator while stores are hydrating
    return (
      <View style={styles.container}>
        <Text>Loading app...</Text>
      </View>
    )
  }

  if (isOnboarding) {
    // Onboarding is not done, redirect to onboarding screen
    return <Redirect href={"/onboarding"} />
  } else {
    // Onboarding is done
    if (user) {
      // User exists, redirect to home
      return <Redirect href={"/(home)/home"} />
    } else {
      // No user, redirect to sign-in
      return <Redirect href={"/(auth)/sign-in"} />
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

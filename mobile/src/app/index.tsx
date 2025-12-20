import React from "react"
import { Redirect } from "expo-router"
import { useAppInitialization } from "../hooks/useAppInitialization"
import { LoadingScreen } from "../components/LoadingScreen"

export default function Index() {
  const { isReady, initialRoute } = useAppInitialization()

  if (!isReady || !initialRoute) {
    return <LoadingScreen />
  }

  // Perform the redirect to the determined route
  return <Redirect href={initialRoute as any} />
}

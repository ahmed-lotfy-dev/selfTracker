import { useEffect, useRef, useState } from "react"
import { useFonts } from "expo-font"
import { Slot, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { checkForUpdates, onAppStateChange } from "@/utils/lib"
import { ActivityIndicator } from "react-native"
import { useOnlineManager } from "@/hooks/useOnlineManager"
import { useAppState } from "@/hooks/useAppState"
import { useAuth } from "@/hooks/useAuth"
import * as SplashScreen from "expo-splash-screen"

import "react-native-reanimated"
import "react-native-gesture-handler"
import "../global.css"

import { AppProviders } from "@/components/AppProviders"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)
  const router = useRouter()

  const { isAuthenticated, isLoading } = useAuth()

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  const hasRedirected = useRef(false)

  useEffect(() => {
    const prepareApp = async () => {
      if (loaded) {
        await checkForUpdates()
        await SplashScreen.hideAsync()
      }
    }

    prepareApp()
  }, [loaded])

  useEffect(() => {
    if (!loaded || isLoading || hasRedirected.current) return

    hasRedirected.current = true

    if (!isAuthenticated) {
      router.replace("/(auth)/welcome")
    } else {
      router.replace("/(home)")
    }
  }, [isAuthenticated, isLoading, loaded])

  // Prevent flashing UI before fonts and auth are ready
  if (!loaded || isLoading) {
    return null
  }

  return (
    <AppProviders>
      <StatusBar
        style="light"
        translucent={true}
        backgroundColor="#0A2540"
        animated={true}
      />
      <Slot />
    </AppProviders>
  )
}

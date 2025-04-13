import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Stack, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { checkForUpdates, onAppStateChange } from "@/utils/lib"
import { AppStateStatus, Platform } from "react-native"
import { useOnlineManager } from "@/hooks/useOnlineManager"
import { useAppState } from "@/hooks/useAppState"
import { useAuth } from "@/hooks/useAuth"

import * as SplashScreen from "expo-splash-screen"

import "react-native-reanimated"
import "react-native-gesture-handler"
import "react-native-reanimated"
import "../global.css"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppProviders } from "@/components/AppProviders"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)

  const router = useRouter()

  const [appIsReady, setAppIsReady] = useState(false)
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  useEffect(() => {
    async function prepareApp() {
      try {
        if (loaded) {
          await checkForUpdates()
          await SplashScreen.hideAsync()
          setAppIsReady(true)
        }
      } catch (error) {
        console.warn(error)
      }
    }

    prepareApp()
  }, [loaded])

  useEffect(() => {
    async function checkAuth() {
      if (!appIsReady) return

      const accessToken = await AsyncStorage.getItem("accessToken")
      const refreshToken = await AsyncStorage.getItem("refreshToken")

      if (accessToken && refreshToken) {
        router.replace("/profile")
      } else {
        router.replace("/welcome")
      }
    }

    checkAuth()
  }, [appIsReady, router])

  if (!appIsReady) {
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
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  )
}

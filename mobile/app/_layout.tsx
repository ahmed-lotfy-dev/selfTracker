import { useEffect, useState } from "react"
import "@/global.css"
import { useFonts } from "expo-font"
import { Stack, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"

import { checkForUpdates, onAppStateChange } from "@/utils/lib"

import { AppStateStatus, Platform } from "react-native"
import { useOnlineManager } from "@/hooks/useOnlineManager"
import { useAppState } from "@/hooks/useAppState"
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
        router.replace("/(home)") 
      } else {
        router.replace("/welcome") 
      }
    }

    checkAuth()
  }, [appIsReady, router])

  if (!appIsReady) {
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
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  )
}

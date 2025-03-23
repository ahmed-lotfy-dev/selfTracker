import { useEffect, useState } from "react"
import "@/global.css"
import { useFonts } from "expo-font"
import { Stack, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"

import { checkForUpdates, onAppStateChange } from "@/utils/lib"

import { AppStateStatus, Platform, Pressable } from "react-native"
import { useOnlineManager } from "@/hooks/useOnlineManager"
import { useAppState } from "@/hooks/useAppState"
import axiosInstance from "@/utils/api/axiosInstane"
import { AppProviders } from "@/components/AppProviders"

import Entypo from "@expo/vector-icons/Entypo"

// Prevent the splash screen from auto-hiding before asset loading is complete.
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
          // await checkForUpdates() // Check for updates when the app loads
          await SplashScreen.hideAsync() // Hide splash screen after updates check
          setAppIsReady(true)
        }
      } catch (error) {
        console.warn(error)
      }
    }

    prepareApp()
    // in production add checkForUpdates in The dependency array
  }, [loaded])

  useEffect(() => {
    async function checkAuth() {
      if (!appIsReady) return // Ensure app is ready before navigation

      const accessToken = await AsyncStorage.getItem("accessToken")
      const refreshToken = await AsyncStorage.getItem("refreshToken")

      if (accessToken && refreshToken) {
        router.replace("/(home)") // Redirect to home if already logged in
      } else {
        router.replace("/welcome") // Redirect to welcome if not logged in
      }
    }

    checkAuth()
  }, [appIsReady])

  if (!appIsReady) {
    return null // Keep splash screen until app is ready
  }

  return (
    <AppProviders>
      <StatusBar
        style="light"
        translucent={true}
        backgroundColor="#0A2540"
        animated={true}
      />
      <Stack
        screenOptions={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
              <Entypo name="chevron-thin-left" size={24} color="black" />
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  )
}

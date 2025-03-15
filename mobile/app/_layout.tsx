import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"

import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"

import { createTamagui, TamaguiProvider, View } from "tamagui"
import { config } from "@/tamagui.config"

import { checkForUpdates, onAppStateChange } from "@/utils/lib"

import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { AppStateStatus, Platform } from "react-native"
import { useOnlineManager } from "@/hooks/useOnlineManager"
import { useAppState } from "@/hooks/useAppState"
import { SafeAreaView } from "react-native-safe-area-context"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)

  const [appIsReady, setAppIsReady] = useState(false)
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 2 } },
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

  if (!appIsReady) {
    return null // Keep splash screen until app is ready
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" translucent />
        </SafeAreaView>
      </TamaguiProvider>
    </QueryClientProvider>
  )
}

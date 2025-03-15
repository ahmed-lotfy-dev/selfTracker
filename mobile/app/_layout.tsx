import { useEffect, useState, useCallback } from "react"
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
})

export default function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)

  const [appIsReady, setAppIsReady] = useState(false)
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  useEffect(() => {
    async function prepareApp() {
      try {
        if (loaded) {
          await checkForUpdates() // Check for updates when the app loads
          await SplashScreen.hideAsync() // Hide splash screen after updates check
          setAppIsReady(true)
        }
      } catch (error) {
        console.warn(error)
      }
    }

    prepareApp()
  }, [loaded, checkForUpdates])

  if (!appIsReady) {
    return null // Keep splash screen until app is ready
  }

  return (
    <>
      <StatusBar style="auto" translucent />
      <SafeAreaView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <TamaguiProvider config={config}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />g
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </TamaguiProvider>
        </QueryClientProvider>
      </SafeAreaView>
    </>
  )
}

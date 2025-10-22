import React, { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Slot, Redirect, Stack, useRouter } from "expo-router"
import { checkForUpdates, onAppStateChange } from "@/src/lib/lib"
import { useOnlineManager } from "@/src/hooks/useOnlineManager"
import { useAppState } from "@/src/hooks/useAppState"
import * as SplashScreen from "expo-splash-screen"
import "react-native-gesture-handler"
import "@/src/global.css"

import { AppProviders } from "@/src/components/Provider/AppProviders"
import { useOnboardingStore } from "../store/useOnboardingStore"
import {
  registerForPushNotificationsAsync,
  setUpNotificationListeners,
} from "../lib/notifications"
import { PortalHost } from "@rn-primitives/portal"
import { Platform, StatusBar, useColorScheme } from "react-native"
import { useAuth } from "../hooks/useAuth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons"
import { Colors } from "../constants/Colors"

SplashScreen.preventAutoHideAsync()

function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)

  const [expoPushToken, setExpoPushToken] = useState<string | undefined>()
  const [appIsReady, setAppIsReady] = useState(false)
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...Ionicons.font,
    ...FontAwesome5.font,
  })

  const { isAuthenticated } = useAuth()
  const { isOnboarding } = useOnboardingStore()
  const colorScheme = useColorScheme()

  useEffect(() => {
    if (Platform.OS !== "web") {
      registerForPushNotificationsAsync().then(setExpoPushToken)
      const cleanup = setUpNotificationListeners({
        onReceive: (notification) => {
          console.log("Notification received in foreground:", notification)
        },
        onResponse: (response) => {
          console.log("User tapped notification:", response)
        },
      })
      return cleanup
    }
    return () => {} // Return an empty cleanup function for web
  }, [])

  useEffect(() => {
    const prepareApp = async () => {
      if (loaded && !appIsReady) {
        checkForUpdates()
        SplashScreen.hide()
        // uncomment it to work on onboarding
        // await AsyncStorage.clear()
        setAppIsReady(true)
      }
    }

    prepareApp()
  }, [loaded, appIsReady])

  if (!appIsReady) {
    return null
  }

  const themeColors = Colors[colorScheme ?? "light"]

  return (
    <AppProviders>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="welcome" />
        </Stack.Protected>
      </Stack>
      <PortalHost />
    </AppProviders>
  )
}

export default RootLayout

import "@/src/polyfills/crypto"
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
import {
  registerForPushNotificationsAsync,
  setUpNotificationListeners,
} from "../lib/notifications"
import { PortalHost } from "@rn-primitives/portal"
import { Platform, StatusBar, useColorScheme } from "react-native"
import {
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import CustomAlert from "@/src/components/ui/CustomAlert"
import Toast from "@/src/components/ui/Toast"
import { useAuth } from "@/src/features/auth/useAuthStore"

SplashScreen.preventAutoHideAsync()

function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)
  const { user, isAuthenticated, isLoading } = useAuth()

  const [expoPushToken, setExpoPushToken] = useState<string | undefined>()
  const [appIsReady, setAppIsReady] = useState(false)
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...Ionicons.font,
    ...FontAwesome5.font,
  })

  const colorScheme = useColorScheme()

  useEffect(() => {
    if (Platform.OS !== "web") {
      registerForPushNotificationsAsync().then(setExpoPushToken)
      const cleanup = setUpNotificationListeners({
        onReceive: (notification) => {
        },
        onResponse: (response) => {
        },
      })
      return cleanup
    }
    return () => { } // Return an empty cleanup function for web
  }, [])

  useEffect(() => {
    const prepareApp = async () => {
      if (loaded && !appIsReady) {
        checkForUpdates()
        SplashScreen.hide()
        setAppIsReady(true)
      }
    }

    prepareApp()
  }, [loaded, appIsReady])

  if (!appIsReady) {
    return null
  }

  const themeColors = Colors[colorScheme ?? "light"]

  const isEmailVerified = user?.emailVerified ?? false
  const canAccessApp = isAuthenticated && isEmailVerified

  return (
    <AppProviders>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={themeColors.background}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Protected guard={canAccessApp}>
          <Stack.Screen name="(drawer)" />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
      <PortalHost />
      <CustomAlert />
      <Toast />
    </AppProviders>
  )
}

export default RootLayout

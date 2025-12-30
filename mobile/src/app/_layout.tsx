import "react-native-random-uuid"
import "@/src/polyfills/crypto"
import React, { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { checkForUpdates, onAppStateChange } from "@/src/lib/lib"
import { useAppState } from "@/src/hooks/useAppState"
import * as SplashScreen from "expo-splash-screen"
import { KeyboardProvider } from "react-native-keyboard-controller"
import "react-native-gesture-handler"
import "@/src/global.css"

import { AppProviders } from "@/src/components/Provider/AppProviders"
import {
  registerForPushNotificationsAsync,
  setUpNotificationListeners,
} from "../lib/notifications"
import { PortalHost } from "@rn-primitives/portal"
import { View, Text, Platform, StatusBar, useColorScheme } from "react-native"
import {
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import CustomAlert from "@/src/components/ui/CustomAlert"
import { BrandedLoadingScreen } from "@/src/components/ui/Loading"

import Toast from "@/src/components/ui/Toast"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { SyncManager } from "@/src/services/SyncManager"

SplashScreen.preventAutoHideAsync()

function RootLayout() {
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
    if (isAuthenticated && appIsReady) {
      SyncManager.startSync()
    }
  }, [isAuthenticated, appIsReady])

  useEffect(() => {
    const prepareApp = async () => {
      if (!appIsReady) {
        checkForUpdates()

        await SyncManager.initialize()

        SplashScreen.hide()
        setAppIsReady(true)
      }
    }

    prepareApp()
  }, [appIsReady])

  const themeColors = Colors[colorScheme ?? "light"]


  return (
    <KeyboardProvider>
      <AppProviders>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={themeColors.background}
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="callback" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <PortalHost />
        <CustomAlert />
        <Toast />
      </AppProviders>
    </KeyboardProvider>
  )
}

export default RootLayout

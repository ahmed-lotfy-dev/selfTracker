import React, { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Slot, Redirect, Stack, useRouter } from "expo-router"
import { checkForUpdates, onAppStateChange } from "@/src/lib/lib"
import { useOnlineManager } from "@/src/hooks/useOnlineManager"
import { useAppState } from "@/src/hooks/useAppState"
import * as SplashScreen from "expo-splash-screen"
import "react-native-gesture-handler"
import "@/src/global.css"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import migrations from "../../drizzle/migrations"
import { db } from "../db/client"
import { runSync, initialSync } from "../services/sync"

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
import { useDeepLinkHandler } from "@/src/hooks/useDeepLinkHandler"

SplashScreen.preventAutoHideAsync()

/**
 * Wrapper component to initialize hooks that need provider context.
 * This component is rendered inside AppProviders so hooks have access to providers.
 */
function DeepLinkWrapper({ children }: { children: React.ReactNode }) {
  useDeepLinkHandler()
  return <>{children}</>
}

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
    return () => { } // Return an empty cleanup function for web
  }, [])

  /* @ts-ignore */
  const { success: migrationSuccess, error: migrationError } = useMigrations(db, migrations)

  useEffect(() => {
    if (migrationError) {
      console.error("Migration error:", migrationError)
      // Optionally show an alert or toast here
    }
  }, [migrationError])

  useEffect(() => {
    const prepareApp = async () => {
      if (loaded && !appIsReady && migrationSuccess) {
        await initialSync()
        checkForUpdates()
        SplashScreen.hide()
        setAppIsReady(true)
      }
    }

    prepareApp()
  }, [loaded, appIsReady, migrationSuccess])

  if (!appIsReady) {
    return null
  }

  const themeColors = Colors[colorScheme ?? "light"]

  return (
    <AppProviders>
      <DeepLinkWrapper>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <PortalHost />
      </DeepLinkWrapper>
    </AppProviders>
  )
}

export default RootLayout

import { useEffect, useRef, useState } from "react"
import { useFonts } from "expo-font"
import { Slot, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { checkForUpdates, onAppStateChange } from "@/src/utils/lib"
import { useOnlineManager } from "@/src/hooks/useOnlineManager"
import { useAppState } from "@/src/hooks/useAppState"
import * as SplashScreen from "expo-splash-screen"

import "react-native-reanimated"
import "react-native-gesture-handler"
import "@/global.css"

import { AppProviders } from "@/src/components/Provider/AppProviders"
import React from "react"
import {
  registerForPushNotificationsAsync,
  setUpNotificationListeners,
} from "../utils/notifications"
import axiosInstance from "../utils/api/axiosInstane"
import { API_BASE_URL } from "../utils/api/config"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>()
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  useEffect(() => {
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
  }, [])
  console.log(expoPushToken)

  useEffect(() => {
    const prepareApp = async () => {
      if (loaded) {
        await checkForUpdates()
        await SplashScreen.hideAsync()
        console.log(expoPushToken)
      }
    }

    prepareApp()
  }, [loaded])

  // if (!loaded) return null

  return (
    <AppProviders>
      <StatusBar style="light" translucent={true} animated={true} />
      <Slot />
    </AppProviders>
  )
}

import "react-native-reanimated"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Slot } from "expo-router"
import { checkForUpdates, onAppStateChange } from "@/src/lib/lib"
import { useOnlineManager } from "@/src/hooks/useOnlineManager"
import { useAppState } from "@/src/hooks/useAppState"
import * as SplashScreen from "expo-splash-screen"

import "react-native-gesture-handler"
import "@/global.css"

import { AppProviders } from "@/src/components/Provider/AppProviders"

import React from "react"

import {
  registerForPushNotificationsAsync,
  setUpNotificationListeners,
} from "../lib/notifications"
import { PortalHost } from "@rn-primitives/portal"
import { StatusBar } from "react-native"
import { COLORS } from "../constants/Colors"

SplashScreen.preventAutoHideAsync()

function RootLayout() {
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

  if (!loaded) {
    return null // or a loading spinner
  }

  return (
    <AppProviders>
      <StatusBar barStyle="default" />
      <Slot/>
      <PortalHost />
    </AppProviders>
  )
}

export default RootLayout

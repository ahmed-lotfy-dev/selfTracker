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
import { useAuth } from "@/src/hooks/useAuth"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useOnlineManager()
  useAppState(onAppStateChange)

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  useEffect(() => {
    const prepareApp = async () => {
      if (loaded) {
        await checkForUpdates()
        await SplashScreen.hideAsync()
      }
    }

    prepareApp()
  }, [loaded])

  // Prevent flashing UI before fonts and auth are ready

  if (!loaded) return null

  return (
    <AppProviders>
      <StatusBar
        style="light"
        translucent={true}
        backgroundColor="#0A2540"
        animated={true}
      />
      <Slot />
    </AppProviders>
  )
}

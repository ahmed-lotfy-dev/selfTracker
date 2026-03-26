import React, { ReactNode, useEffect, useState } from "react"
import { Platform } from "react-native"
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "@/src/features/auth/useAuthStore"
import { useAppState } from "@/src/hooks/useAppState"
import { onAppStateChange, checkForUpdates } from "@/src/lib/lib"
import { SyncManager } from "@/src/services/SyncManager"
import {
  registerForPushNotificationsAsync,
  setUpNotificationListeners
} from "@/src/lib/notifications"
import { LoadingOverlay } from "@/src/components/ui/Loading"
import { ToastProvider } from "@/src/hooks/useToast"

import { useThemeColors } from "@/src/constants/Colors"

SplashScreen.preventAutoHideAsync()

interface RootProviderProps {
  children: ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  const colors = useThemeColors()
  useAppState(onAppStateChange)
  const { isAuthenticated, isLoading } = useAuth()
  const [appIsReady, setAppIsReady] = useState(false)

  const [fontsLoaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...Ionicons.font,
    ...FontAwesome5.font,
  })

  useEffect(() => {
    if (Platform.OS !== "web") {
      registerForPushNotificationsAsync()
      const cleanup = setUpNotificationListeners({
        onReceive: () => { },
        onResponse: () => { },
      })
      return cleanup
    }
  }, [])

  useEffect(() => {
    const prepare = async () => {
      try {
        checkForUpdates()
        await SyncManager.initialize()
      } catch (e) {
        console.warn("App init error:", e)
      } finally {
        setAppIsReady(true)
      }
    }
    prepare()
  }, [])

  useEffect(() => {
    if (fontsLoaded && appIsReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, appIsReady])

  useEffect(() => {
    if (!appIsReady || !isAuthenticated) return
    SyncManager.startSync().catch((e) => console.warn("Sync error:", e))
  }, [appIsReady, isAuthenticated])

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <ToastProvider>
            {isLoading && <LoadingOverlay />}
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
              {children}
            </SafeAreaView>
          </ToastProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

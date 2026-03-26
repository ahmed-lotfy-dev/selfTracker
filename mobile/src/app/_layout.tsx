import "react-native-gesture-handler"
import "react-native-random-uuid"
import "@/src/polyfills/crypto"
import { Appearance } from "react-native"

const _origSetColorScheme = Appearance.setColorScheme.bind(Appearance)
Appearance.setColorScheme = (scheme: any) => {
  _origSetColorScheme(scheme ?? "unspecified")
}

import React from "react"
import { Stack } from "expo-router"
import { StatusBar, useColorScheme } from "react-native"
import { Colors } from "../constants/Colors"
import { RootProvider } from "@/src/components/Provider/RootProvider"
import { PortalHost } from "@rn-primitives/portal"
import CustomAlert from "@/src/components/ui/CustomAlert"
import Toast from "@/src/components/ui/Toast"
import "@/src/global.css"

function RootLayout() {
  const colorScheme = useColorScheme()
  const themeColors = Colors[(colorScheme === "dark" ? "dark" : "light")]

  return (
    <RootProvider>
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
    </RootProvider>
  )
}

export default RootLayout

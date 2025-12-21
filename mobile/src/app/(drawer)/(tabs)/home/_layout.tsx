import { Stack } from "expo-router"
import React from "react"

export default function HomeScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: "Home",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}

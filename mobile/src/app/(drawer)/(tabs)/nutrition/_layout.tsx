import React from "react"
import { Stack } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"

export default function NutritionLayout() {
  const colors = useThemeColors()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="log"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom"
        }}
      />
      <Stack.Screen
        name="goals"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom"
        }}
      />
    </Stack>
  )
}

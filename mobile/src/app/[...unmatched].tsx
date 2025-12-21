import { useLocalSearchParams, usePathname } from "expo-router"
import { View, Text } from "react-native"
import { useEffect } from "react"
import React from "react"

export default function CatchAll() {
  const params = useLocalSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    console.log("[404 DEBUG] Route hit:", pathname)
    console.log("[404 DEBUG] Params:", JSON.stringify(params, null, 2))
  }, [pathname, params])

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-2xl font-bold text-error mb-4">404 - Not Found</Text>
      <Text className="text-text mb-2">Route: {pathname}</Text>
      <Text className="text-placeholder text-sm">Params: {JSON.stringify(params)}</Text>
    </View>
  )
}

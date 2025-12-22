import React, { useEffect } from "react"
import { View, Text } from "react-native"
import { useToastStore } from "@/src/features/ui/useToastStore";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

export default function Toast() {
  const { visible, message, type, hideToast } = useToastStore()
  const colors = useThemeColors()

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        hideToast()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, hideToast])

  if (!visible) return null

  const getIconName = () => {
    switch (type) {
      case "success": return "check-circle"
      case "error": return "alert-circle"
      default: return "info"
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success": return "bg-emerald-500" // Use tailwind class logic if possible, but strict colors for toast states are usually safer
      case "error": return "bg-red-500"
      default: return "bg-blue-500"
    }
  }

  // Map to tailwind classes for background
  const bgClass =
    type === 'success' ? 'bg-success' :
      type === 'error' ? 'bg-error' :
        'bg-primary'

  return (
    <View className="absolute top-12 left-4 right-4 z-50 items-center pointer-events-none">
      <Animated.View
        entering={FadeInUp.springify().damping(15)}
        exiting={FadeOutUp}
        className={`flex-row items-center px-4 py-3 rounded-full shadow-lg ${bgClass} shadow-black/20`}
      >
        <Feather name={getIconName()} size={20} color="white" />
        <Text className="text-white font-semibold ml-2 text-sm">
          {message}
        </Text>
      </Animated.View>
    </View>
  )
}

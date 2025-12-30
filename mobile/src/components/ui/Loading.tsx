import React from "react"
import { View, Text, ActivityIndicator, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useThemeColors } from "@/src/constants/Colors"

interface LoadingProps {
  message?: string
}

/**
 * A full-screen loading indicator that adapts to the current theme.
 * Uses Uniwind classNames for layout and dynamic style for theme colors.
 */
export const LoadingIndicator = ({ message }: LoadingProps) => {
  const colors = useThemeColors()
  return (
    <SafeAreaView
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: colors.background }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text
          className="mt-3 text-sm font-medium"
          style={{ color: colors.text }}
        >
          {message}
        </Text>
      )}
    </SafeAreaView>
  )
}

/**
 * Branded loading screen with app icon for initial app load
 */
export const BrandedLoadingScreen = ({ message = "Loading..." }: LoadingProps) => {
  const colors = useThemeColors()
  return (
    <SafeAreaView
      className="flex-1 justify-center items-center px-6"
      style={{ backgroundColor: colors.background }}
    >
      <Image
        source={require('@/assets/images/icon.png')}
        className="w-32 h-32 mb-10 rounded-3xl"
      />

      <ActivityIndicator
        size="large"
        color={colors.primary}
        className="my-6"
      />

      <Text className="text-xl font-semibold mt-4 text-center" style={{ color: colors.text }}>
        {message}
      </Text>
    </SafeAreaView>
  )
}

/**
 * A light, semi-transparent overlay with a loading spinner.
 */
export const LoadingOverlay = () => {
  const colors = useThemeColors()
  return (
    <View
      className="absolute inset-0 z-50 justify-center items-center"
      style={{ backgroundColor: colors.background + '4D' }}
    >
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  )
}

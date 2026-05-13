import React from "react"
import { View, Dimensions } from "react-native"
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated"
import { onboardingSteps } from "./onboardingData"
import { useThemeColors } from "@/src/constants/Colors"

const { width } = Dimensions.get("window")

interface OnboardingPaginatorProps {
  scrollX: SharedValue<number>
}

export default function OnboardingPaginator({ scrollX }: OnboardingPaginatorProps) {
  const colors = useThemeColors()

  return (
    <View className="flex-row h-16 items-center">
      {onboardingSteps.map((_, index) => {
        const animatedDotStyle = useAnimatedStyle(() => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ]

          const widthAnim = interpolate(
            scrollX.value,
            inputRange,
            [8, 24, 8],
            Extrapolation.CLAMP
          )

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.4, 1, 0.4],
            Extrapolation.CLAMP
          )

          const color = interpolateColor(
            scrollX.value,
            inputRange,
            [colors.text, colors.secondary, colors.text]
          )

          return {
            width: widthAnim,
            opacity,
            backgroundColor: color,
          }
        })

        return (
          <Animated.View
            key={index.toString()}
            className="h-2 rounded-full mx-1"
            style={animatedDotStyle}
          />
        )
      })}
    </View>
  )
}

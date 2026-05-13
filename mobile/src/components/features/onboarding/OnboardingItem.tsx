import React from "react"
import { View, Text, Image, Dimensions } from "react-native"
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated"
import { OnboardingStep } from "./onboardingData"

const { width } = Dimensions.get("window")

interface OnboardingItemProps {
  item: OnboardingStep
  index: number
  scrollX: SharedValue<number>
}

export default function OnboardingItem({ item, index, scrollX }: OnboardingItemProps) {
  const animatedImageStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ]

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    )

    return {
      transform: [{ scale }],
    }
  })

  const animatedTextStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 0.5) * width,
      index * width,
      (index + 0.5) * width,
    ]
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    )

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50],
      Extrapolation.CLAMP
    )
    
    return {
      opacity,
      transform: [{ translateY }]
    }
  })

  return (
    <View className="flex-1" style={{ width }}>
      <View className="flex-[0.6] justify-center items-center">
        <Animated.View
          className="justify-center items-center"
          style={[{ width: width * 0.9, height: width * 0.9 }, animatedImageStyle]}
        >
          <Image
            source={item.image}
            className="w-full h-full"
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <View className="flex-[0.4] px-8 justify-start pt-8">
        <Animated.View style={animatedTextStyle}>
          <Text className="text-3xl font-extrabold text-left leading-10 mb-4 text-primary">
            {item.title}
          </Text>
          <Text className="text-lg font-medium text-left leading-6 text-placeholder">
            {item.description}
          </Text>
        </Animated.View>
      </View>
    </View>
  )
}

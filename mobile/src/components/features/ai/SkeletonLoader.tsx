import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'

function PulseBlock({ className }: { className: string }) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={animatedStyle}
      className={`rounded-xl bg-white/10 ${className}`}
    />
  )
}

export function InsightCardSkeleton() {
  return (
    <View className="rounded-2xl bg-card border border-white/10 p-4 gap-3">
      <View className="flex-row items-center gap-3">
        <PulseBlock className="w-10 h-10" />
        <View className="gap-2 flex-1">
          <PulseBlock className="h-4 w-40" />
          <PulseBlock className="h-3 w-64" />
        </View>
      </View>
      <View className="ml-[52px]">
        <PulseBlock className="h-3 w-48" />
      </View>
    </View>
  )
}

export function ChatBubbleSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <View
      className={`mb-4 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && <PulseBlock className="w-8 h-8 mr-2" />}
      <View className={isUser ? 'items-end' : 'items-start'}>
        <PulseBlock
          className={`h-16 ${
            isUser ? 'w-52' : 'w-64'
          } rounded-2xl bg-primary/20`}
        />
      </View>
      {isUser && <PulseBlock className="w-8 h-8 ml-2" />}
    </View>
  )
}

export function AnalyticsTabSkeleton() {
  return (
    <View className="px-4 pt-4 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </View>
  )
}

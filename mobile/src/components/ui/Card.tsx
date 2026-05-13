import React from "react"
import { View, Pressable } from "react-native"
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated'
import { cn } from '@/src/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
  onPress?: () => void
}

export default function Card({ children, className, noPadding = false, onPress }: CardProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  const handlePressIn = () => { scale.value = withSpring(0.98) }
  const handlePressOut = () => { scale.value = withSpring(1) }

  const cardClass = cn(
    "bg-card rounded-2xl border border-border overflow-hidden",
    !noPadding && "p-4",
    className
  )

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={cardClass}
        >
          {children}
        </Pressable>
      </Animated.View>
    )
  }

  return <View className={cardClass}>{children}</View>
}

import React, { useEffect } from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface AiFabProps {
  onPress: () => void
  hasNewInsight?: boolean
}

export default function AiFab({ onPress, hasNewInsight = false }: AiFabProps) {
  const pulse = useSharedValue(1)

  useEffect(() => {
    if (hasNewInsight) {
      pulse.value = withRepeat(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    } else {
      pulse.value = 1
    }
  }, [hasNewInsight])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          bottom: 100,
          right: 20,
          zIndex: 999,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          onPress()
        }}
        className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30 active:opacity-80"
        style={
          hasNewInsight
            ? {
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: 10,
              }
            : undefined
        }
      >
        <Text className="text-white text-2xl">✨</Text>
      </Pressable>
    </Animated.View>
  )
}

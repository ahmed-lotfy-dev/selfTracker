import React, { useState } from "react"
import { View, Text, TextInput, TextInputProps } from "react-native"
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated'
import { cn } from '@/src/lib/utils'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerClassName?: string
}

export default function Input({ label, error, containerClassName, className, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)
  const borderShimmer = useSharedValue(0)

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + borderShimmer.value * 0.4,
  }))

  return (
    <View className={cn("mb-4", containerClassName)}>
      {label && (
        <Animated.Text className="text-sm font-medium text-text mb-1.5 ml-1" style={labelStyle}>
          {label}
        </Animated.Text>
      )}
      <TextInput
        placeholderTextColor="var(--color-placeholder)"
        onFocus={(e) => { setFocused(true); borderShimmer.value = withSpring(1); props.onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); borderShimmer.value = withSpring(0); props.onBlur?.(e) }}
        className={cn(
          "bg-inputBackground text-inputText border rounded-xl px-4 py-3 text-base",
          focused ? "border-primary border-2" : "border-border",
          error && "border-error",
          className
        )}
        {...props}
      />
      {error && <Text className="text-error text-xs mt-1.5 ml-1">{error}</Text>}
    </View>
  )
}

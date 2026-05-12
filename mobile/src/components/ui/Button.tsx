import React from "react"
import { Pressable, Text, ActivityIndicator } from "react-native"
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated'
import { cn } from '@/src/lib/utils'
import type { ButtonProps } from '@/src/types/uiType'

export default function Button({
  onPress,
  children,
  variant = "primary",
  size = "default",
  loading = false,
  disabled = false,
  className,
  textClassName,
  fullWidth = true,
}: ButtonProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  const handlePressIn = () => { scale.value = withSpring(0.97) }
  const handlePressOut = () => { scale.value = withSpring(1) }

  const baseStyles = "rounded-2xl items-center justify-center flex-row"

  const variants: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border border-primary",
    ghost: "bg-transparent shadow-none",
    danger: "bg-error",
    error: "bg-error",
    success: "bg-success",
  }

  const sizes: Record<string, string> = {
    sm: "py-1.5 px-3",
    default: "py-3 px-4",
    lg: "py-4 px-6",
  }

  const textVariants: Record<string, string> = {
    primary: "text-white",
    secondary: "text-primary-dark",
    outline: "text-primary",
    ghost: "text-primary",
    danger: "text-white",
    error: "text-white",
    success: "text-white",
  }

  const textSizes: Record<string, string> = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
  }

  const isDisabled = disabled || loading

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={isDisabled ? undefined : handlePressIn}
        onPressOut={isDisabled ? undefined : handlePressOut}
        className={cn(
          baseStyles,
          variants[variant] || variants.primary,
          sizes[size] || sizes.default,
          fullWidth ? "w-full" : "self-start",
          isDisabled && (variant === 'primary' || variant === 'secondary' || variant === 'danger' || variant === 'success' || variant === 'error') && "bg-border",
          isDisabled && "opacity-70",
          className
        )}
      >
        {loading ? (
          <ActivityIndicator
            className={variant === 'outline' || variant === 'ghost' || variant === 'secondary' ? "text-primary" : "text-white"}
            size="small"
          />
        ) : (
          <Text className={cn("font-bold text-center", textVariants[variant] || textVariants.primary, textSizes[size] || textSizes.default, textClassName)}>
            {children}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  )
}

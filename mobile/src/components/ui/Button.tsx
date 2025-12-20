import React from "react"
import { Pressable, Text, ActivityIndicator } from "react-native"
import { cn } from '@/src/lib/utils'

interface ButtonProps {
  onPress: () => void
  children: React.ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "default" | "lg"
  loading?: boolean
  disabled?: boolean
  className?: string
  textClassName?: string
  fullWidth?: boolean
}

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

  const baseStyles = "rounded-2xl items-center justify-center flex-row shadow-sm active:opacity-90 transition-opacity"

  const variants = {
    primary: "bg-primary shadow-sm", // Simplified shadow for now or use specific class if defined
    secondary: "bg-secondary shadow-sm",
    outline: "bg-transparent border border-primary",
    ghost: "bg-transparent shadow-none",
    danger: "bg-error shadow-sm",
  }

  const sizes = {
    sm: "py-2 px-3",
    default: "py-3 px-4",
    lg: "py-4 px-6",
  }

  const textBaseStyles = "font-bold text-center"

  const textVariants = {
    primary: "text-white",
    secondary: "text-primary-dark", // Dark green text on light green
    outline: "text-primary",
    ghost: "text-primary",
    danger: "text-white",
  }

  const textSizes = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
  }

  const disabledStyles = "opacity-50 bg-border shadow-none"

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "self-start",
        (disabled || loading) && variant !== 'ghost' && variant !== 'outline' ? "bg-border shadow-none" : "",
        (disabled || loading) ? "opacity-70" : "",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator className={variant === 'outline' || variant === 'ghost' || variant === 'secondary' ? "text-primary" : "text-white"} size="small" />
      ) : (
        <Text className={cn(textBaseStyles, textVariants[variant], textSizes[size], textClassName)}>
          {children}
        </Text>
      )}
    </Pressable>
  )
}

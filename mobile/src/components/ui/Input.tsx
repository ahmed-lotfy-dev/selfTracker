import React from "react"
import { View, Text, TextInput, TextInputProps } from "react-native"
import { cn } from '@/src/lib/utils'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerClassName?: string
}

export default function Input({ label, error, containerClassName, className, ...props }: InputProps) {
  return (
    <View className={cn("mb-4", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-text mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="var(--color-placeholder)"
        className={cn(
          "bg-inputBackground text-inputText border border-border rounded-xl px-4 py-3 text-base shadow-sm",
          "focus:border-primary focus:border-2",
          error && "border-error focus:border-error",
          className
        )}
        {...props}
      />
      {error && <Text className="text-error text-xs mt-1.5 ml-1">{error}</Text>}
    </View>
  )
}

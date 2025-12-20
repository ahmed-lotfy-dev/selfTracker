import React from "react"
import { View, Text } from "react-native"
import Card from "./Card"

interface SectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  error?: string
}

export function Section({ title, children, className, error }: SectionProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {title && (
        <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 ml-1">
          {title}
        </Text>
      )}
      <Card noPadding>
        {children}
      </Card>
      {error && (
        <Text className="text-error text-sm mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  )
}

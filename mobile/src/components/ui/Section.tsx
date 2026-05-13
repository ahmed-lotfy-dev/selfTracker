import React from "react"
import { View, Text } from "react-native"
import { PremiumCard } from "./PremiumCard"

interface SectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  error?: string
}

export function Section({ title, children, className, error }: SectionProps) {
  return (
    <View className={`mb-8 ${className}`}>
      {title && (
        <Text className="text-[10px] font-black text-white/40 uppercase tracking-[2px] mb-3 ml-2">
          {title}
        </Text>
      )}
      <PremiumCard 
        gradientColors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
        containerStyle="p-0 border-white/5"
      >
        {children}
      </PremiumCard>
      {error && (
        <Text className="text-red-500 text-[10px] font-bold mt-2 ml-2 uppercase tracking-tight">
          {error}
        </Text>
      )}
    </View>
  )
}

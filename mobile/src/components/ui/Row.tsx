import React from "react"
import { View, Text } from "react-native"
import { Feather } from "@expo/vector-icons"
import { cn } from '@/src/lib/utils'
import { useThemeColors } from "@/src/constants/Colors"

interface RowProps {
  label: string
  icon?: keyof typeof Feather.glyphMap
  children?: React.ReactNode
  isLast?: boolean
  className?: string
}

export default function Row({ label, icon, children, isLast = false, className }: RowProps) {
  const colors = useThemeColors()
  return (
    <View className={cn(
      "flex-row items-center py-4 px-4 bg-card",
      !isLast && "border-b border-border",
      className
    )}>
      {icon && (
        <View className="w-8 items-center justify-center mr-3">
          <Feather name={icon} size={20} color={colors.primary} />
        </View>
      )}
      <View className="flex-1 mr-2">
        <Text className="text-base text-text font-medium">{label}</Text>
      </View>
      <View className="flex-row items-center justify-end" style={{ minWidth: 80 }}>
        {children}
      </View>
    </View>
  )
}

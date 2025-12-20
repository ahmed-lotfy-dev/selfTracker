import React from "react"
import { View, Text, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface SettingsButtonProps {
  title: string
  subtitle?: string
  icon: keyof typeof Feather.glyphMap
  iconColor?: string
  titleColor?: string
  onPress: () => void
  disabled?: boolean
  showBorder?: boolean
}

export default function SettingsButton({
  title,
  subtitle,
  icon,
  iconColor,
  titleColor,
  onPress,
  disabled = false,
  showBorder = true,
}: SettingsButtonProps) {
  const colors = useThemeColors()
  const finalIconColor = iconColor || colors.placeholder
  const finalTitleColor = titleColor || "text-text"

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={showBorder ? "border-t border-border" : ""}
    >
      <View className="flex-row items-center py-4 px-4 bg-card active:bg-inputBackground">
        <View className="w-8 items-center justify-center mr-3">
          <Feather name={icon} size={20} color={finalIconColor} />
        </View>
        <View className="flex-1">
          <Text className={`text-base font-medium ${finalTitleColor}`}>{title}</Text>
          {subtitle && <Text className="text-xs text-placeholder">{subtitle}</Text>}
        </View>
        <Feather name="chevron-right" size={20} color={finalIconColor} />
      </View>
    </Pressable>
  )
}

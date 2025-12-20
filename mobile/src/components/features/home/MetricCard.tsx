import { View, Text } from "react-native"
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import React from "react"
import { useThemeColors } from "@/src/constants/Colors"

interface MetricsCardProps {
  icon: React.ComponentProps<typeof MaterialIcons>["name"]
  value: string | number
  label: string
  variant?: "primary" | "secondary"
}

export const MetricsCard = ({
  icon,
  value,
  label,
  variant = "primary",
}: MetricsCardProps) => {
  const colors = useThemeColors()

  const iconColor = variant === "primary" ? colors.primary : colors.text
  const labelColor = variant === "primary" ? "text-primary" : "text-text-secondary"

  return (
    <View className="items-center flex-1">
      <MaterialIcons name={icon} size={22} color={iconColor} />

      <Text className="text-lg font-bold mt-2 mb-1 text-text">{value}</Text>
      <Text className={`text-sm ${labelColor}`}>{label}</Text>
    </View>
  )
}


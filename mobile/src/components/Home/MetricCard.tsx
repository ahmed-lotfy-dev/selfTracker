// src/components/Dashboard/MetricsCard.tsx
import { View, Text } from "react-native"
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import React from "react"

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
  const colors = {
    primary: "text-blue-500",
    secondary: "text-gray-500",
  }

  return (
    <View className="items-center flex-1">
      <MaterialIcons name={icon} size={22} className="text-blue-500" />

      <Text className="text-lg font-bold mt-2 mb-1">{value}</Text>
      <Text className={"text-sm text-blue-500"}>{label}</Text>
    </View>
  )
}

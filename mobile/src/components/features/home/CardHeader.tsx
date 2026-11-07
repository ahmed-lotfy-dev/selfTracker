import { View, Text } from "react-native"
import React from "react"
import { Link } from "expo-router"
import { AntDesign } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface CardHeaderProps {
  title: string
  route: string
}
export const CardHeader = ({ title, route }: CardHeaderProps) => {
  const colors = useThemeColors()
  return (
    <View className="flex-row  justify-between items-center">
      <Text className="text-md font-semibold mb-3 text-text">
        {title}
      </Text>
      <Link href={route as any}>
        <AntDesign name="right" size={20} color={colors.primary} />
      </Link>
    </View>
  )
}

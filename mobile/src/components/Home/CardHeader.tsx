import { View, Text } from "react-native"
import React from "react"
import { Link, Route } from "expo-router"
import { AntDesign } from "@expo/vector-icons"

interface CardHeaderProps {
  title: string
  route: Route
}
export const CardHeader = ({ title, route }: CardHeaderProps) => {
  return (
    <View className="flex-row  justify-between items-center">
      <Text className="text-md font-semibold mb-3 text-orange-950">
        {title}
      </Text>
      <Link href={`${route}`}>
        <AntDesign name="right" size={20} color="blue" />
      </Link>
    </View>
  )
}

import { View, Text, Pressable } from "react-native"
import { Route } from "expo-router"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <View className="flex-row justify-center items-center relative">
      <Text className="text-2xl font-bold">{title}</Text>
    </View>
  )
}

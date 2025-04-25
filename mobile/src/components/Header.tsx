import { View, Text, Pressable } from "react-native"
import { Route } from "expo-router"

interface HeaderProps {
  title: string
  className?: string
}

export default function Header({ title, className }: HeaderProps) {
  return (
    <View className={`flex-row justify-center items-center relative mya-5 ${className}`}>
      <Text className="text-2xl font-bold">{title}</Text>
    </View>
  )
}

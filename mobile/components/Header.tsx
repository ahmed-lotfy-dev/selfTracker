import { View, Text, Pressable } from "react-native"
import { Route, useRouter } from "expo-router"
import Entypo from "@expo/vector-icons/Entypo"

interface HeaderProps {
  title: string
  addPath: string
}

export default function Header({ title, addPath }: HeaderProps) {
  const router = useRouter()

  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-2xl font-bold">{title}</Text>
      <Pressable onPress={() => router.push(addPath as Route)}>
        <Entypo name="plus" size={24} color="black" />
      </Pressable>
    </View>
  )
}

import Entypo from "@expo/vector-icons/Entypo"
import { Route, useRouter } from "expo-router"
import { View, Text, Pressable } from "react-native"

export default function BackButton({
  backTo,
  className,
}: {
  backTo: Route
  className?: string
}) {
  const router = useRouter()

  return (
    <View className={`${className}`}>
      <Pressable onPress={() => router.push(backTo)}>
        <Entypo name="chevron-left" className="" size={24} />
      </Pressable>
    </View>
  )
}

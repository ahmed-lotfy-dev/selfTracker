import Entypo from "@expo/vector-icons/Entypo"
import { Stack, useRouter } from "expo-router"
import { Pressable } from "react-native"

export default function WeightsLayout() {
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
            <Entypo name="chevron-thin-left" size={24} color="black" />
          </Pressable>
        ),
        headerShown: false,
      }}
    />
  )
}

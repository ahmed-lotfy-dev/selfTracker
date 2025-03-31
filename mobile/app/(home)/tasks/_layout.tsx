import Entypo from "@expo/vector-icons/Entypo"
import { Stack, useRouter } from "expo-router"
import { Pressable } from "react-native"

export default function WeightsLayout() {
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Tasks",
        }}
      />
      {/* <Stack.Screen
        name="[id]"
        options={{
          title: "Weight Log",
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.push("/weights")}>
              <Entypo name="chevron-left" size={24} />
            </Pressable>
          ),
        }}
      /> */}
      {/* <Stack.Screen
        name="add"
        options={{
          title: "Add Weight",
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.push("/weights")}>
              <Entypo name="chevron-left" size={24} />
            </Pressable>
          ),
        }}
      /> */}
    </Stack>
  )
}

import Entypo from "@expo/vector-icons/Entypo"
import { Stack, useRouter } from "expo-router"
import { Pressable } from "react-native"

export default function WeightsLayout() {
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Workouts",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Workout Log",
          headerLeft: () => (
            <Pressable onPress={() => router.push("/workouts")}>
              <Entypo name="chevron-left" size={24} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Workout",
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.push("/workouts")}>
              <Entypo name="chevron-left" size={24} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  )
}

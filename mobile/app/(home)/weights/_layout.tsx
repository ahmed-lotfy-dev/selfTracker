import BackButton from "@/components/BackButton"
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
          title: "Weights",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Weight Log",
          headerTitleAlign: "center",
          headerShown: true,
          headerLeft: () => <BackButton backTo="/weights" />,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Weight",
          headerTitleAlign: "center",

          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: true,
          headerLeft: () => <BackButton backTo="/weights" />,
        }}
      />
    </Stack>
  )
}

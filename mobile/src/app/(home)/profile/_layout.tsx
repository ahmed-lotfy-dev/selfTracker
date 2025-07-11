import Entypo from "@expo/vector-icons/Entypo"
import { Stack, useRouter } from "expo-router"
import React from "react"
import { Pressable } from "react-native"

export default function WeightsLayout() {
  const router = useRouter()

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="[id]"
        options={{
          title: "Weight Log",
          headerShown: true,
          headerLeft: () => <BackButton backTo="/profile" />,
        }}
      /> */}
      {/* <Stack.Screen
        name="add"
        options={{
          title: "Add Weight",
          headerShown: true,
          headerLeft: () => <BackButton backTo="/profile" />,
        }}
      /> */}
    </Stack>
  )
}

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
    </Stack>
  )
}

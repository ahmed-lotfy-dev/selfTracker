import BackButton from "@/src/components/Buttons/BackButton"
import Entypo from "@expo/vector-icons/Entypo"
import { Stack, useRouter } from "expo-router"
import React from "react"

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
        title: "Weights",
        headerShown: true,
        headerTitleAlign: "center",
        headerLeft: () => <BackButton backTo="/" />,
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
        presentation: "formSheet",
        headerShown: true,
        animation: "slide_from_bottom",
        headerLeft: () => <BackButton backTo="/weights" />,
      }}
      />
      <Stack.Screen
      name="edit"
      options={{
        title: "Edit Weight",
        headerTitleAlign: "center",
        presentation: "formSheet",
        animation: "slide_from_bottom",
        headerShown: true,
        headerLeft: () => <BackButton backTo="/weights" />,
      }}
      />
    </Stack>
  )
}

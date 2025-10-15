import BackButton from "@/src/components/Buttons/BackButton"
import Entypo from "@expo/vector-icons/Entypo"
import { Stack, useRouter } from "expo-router"
import React from "react"

export default function WorkoutsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Workouts",
          headerShown: false,
          headerTitleAlign: "center",
          headerLeft: () => <BackButton backTo="/" />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Workout Log",
          headerTitleAlign: "center",
          headerShown: false,
          headerLeft: () => <BackButton backTo="/workouts" />,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Workout",
          headerTitleAlign: "center",
          presentation: "formSheet",
          headerShown: false,
          animation: "slide_from_bottom",
          headerLeft: () => <BackButton backTo="/workouts" />,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Workout",
          headerShown: false,
          headerTitleAlign: "center",
          presentation: "formSheet",
          animation: "slide_from_bottom",
          headerLeft: () => <BackButton backTo="/workouts" />,
        }}
      />
    </Stack>
  )
}

import BackButton from "@/src/components/BackButton"
import Entypo from "@expo/vector-icons/Entypo"
import { Stack, useRouter } from "expo-router"

export default function WorkoutsLayout() {
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
          title: "Workout Log",
          headerTitleAlign: "center",
          headerShown: true,
          headerLeft: () => <BackButton backTo="/workouts" />,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Workout",
          headerShown: true,
          headerTitleAlign: "center",
          presentation: "modal",
          headerTransparent: true,
          animation: "slide_from_bottom",
          headerLeft: () => <BackButton backTo="/workouts" />,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Workout",
          headerShown: true,
          headerTitleAlign: "center",
          presentation: "modal",
          headerTransparent: true,
          animation: "slide_from_bottom",
          headerLeft: () => <BackButton backTo="/workouts" />,
        }}
      />
    </Stack>
  )
}

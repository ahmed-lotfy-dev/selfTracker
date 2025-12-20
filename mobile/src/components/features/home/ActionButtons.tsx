import React from "react"
import { View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { COLORS } from "@/src/constants/Colors"

interface ActionButtonProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]
  label: string
  onPress: () => void
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center p-3 rounded-xl shadow-sm mx-2 my-2 bg-card border border-border"
    >
      <MaterialCommunityIcons
        name={
          icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]
        }
        size={24}
        color={COLORS.primary}
      />

      <Text className="text-primary text-sm font-semibold mt-2">{label}</Text>
    </Pressable>
  )
}

export default function ActionButtons() {
  const router = useRouter()

  return (
    <View className="flex-row flex-wrap justify-center">
      <ActionButton
        icon="plus-circle"
        label="Weight"
        onPress={() => router.push("/(home)/weights/add")}
      />
      <ActionButton
        icon="plus-circle"
        label="Workout"
        onPress={() => router.push("/(home)/workouts/add")}
      />
      <ActionButton
        icon="plus-circle"
        label="Task"
        onPress={() => router.push("/(home)/tasks")}
      />
    </View>
  )
}

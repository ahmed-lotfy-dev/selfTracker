import React from "react"
import { View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { COLORS } from "@/src/constants/Colors"

interface ActionButtonProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] | React.ComponentProps<typeof Ionicons>["name"] | React.ComponentProps<typeof FontAwesome5>["name"];
  label: string;
  onPress: () => void;
  color: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, color }) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center p-3 rounded-xl shadow-md mx-2 my-2" 
      style={{ backgroundColor: color }}
    >
      {icon === "dumbbell" || icon === "tasks" ? (
        <FontAwesome5 name={icon as React.ComponentProps<typeof FontAwesome5>["name"]} size={24} color="white" />
      ) : icon === "scale" ? (
        <Ionicons name={icon as React.ComponentProps<typeof Ionicons>["name"]} size={24} color="white" />
      ) : (
        <MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]} size={24} color="white" />
      )}
      <Text className="text-white text-sm font-semibold mt-2">{label}</Text>
    </Pressable>
  );
};

export default function ActionButtons() {
  const router = useRouter()

  return (
    <View className="flex-row flex-wrap justify-center  mt-6 mb-4">
      <ActionButton
        icon="scale"
        label="New Weight"
        onPress={() => router.push("/(home)/weights/add")}
        color={COLORS.darkGreen}
      />
      <ActionButton
        icon="dumbbell"
        label="New Workout"
        onPress={() => router.push("/(home)/workouts/add")}
        color={COLORS.darkGreen}
      />
      <ActionButton
        icon="tasks"
        label="New Task"
        onPress={() => router.push("/(home)/tasks")} 
        color={COLORS.darkGreen}
      
      />
    </View>
  )
}

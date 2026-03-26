import React from "react"
import { View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { MaterialCommunityIcons, FontAwesome5, Feather, Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface ActionButtonProps {
  icon: any
  iconType: 'mci' | 'fa5' | 'feather' | 'ionicon'
  label: string
  color: string
  onPress: () => void
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, iconType, label, color, onPress }) => {
  const IconComponent = iconType === 'mci' ? MaterialCommunityIcons
    : iconType === 'fa5' ? FontAwesome5
    : iconType === 'ionicon' ? Ionicons
    : Feather

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center py-3 px-1 rounded-2xl active:opacity-70"
      style={{ 
        backgroundColor: `${color}12`,
        borderWidth: 1,
        borderColor: `${color}20`,
      }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-1.5"
        style={{ backgroundColor: `${color}20` }}
      >
        <IconComponent name={icon} size={16} color={color} />
      </View>
      <Text
        className="text-[9px] font-black uppercase tracking-tight text-center"
        style={{ color: `${color}cc` }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export default function ActionButtons() {
  const router = useRouter()
  const colors = useThemeColors()

  return (
    <View className="flex-row gap-2 px-1">
      <ActionButton
        icon="weight"
        iconType="fa5"
        label="Weight"
        color={colors.statSecondary}
        onPress={() => router.push("/home/weights")}
      />
      <ActionButton
        icon="dumbbell"
        iconType="fa5"
        label="Workout"
        color={colors.statQuaternary}
        onPress={() => router.push("/home/workouts")}
      />
      <ActionButton
        icon="check-circle"
        iconType="feather"
        label="Task"
        color={colors.primary}
        onPress={() => router.push("/home/tasks")}
      />
      <ActionButton
        icon="flame"
        iconType="ionicon"
        label="Habits"
        color="#f59e0b"
        onPress={() => router.push("/home/habits_stack")}
      />
      <ActionButton
        icon="leaf"
        iconType="ionicon"
        label="Food"
        color="#34d399"
        onPress={() => router.push("/nutrition")}
      />
    </View>
  )
}

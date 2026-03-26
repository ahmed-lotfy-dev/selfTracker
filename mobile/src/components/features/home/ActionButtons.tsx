import React from "react"
import { View, Text } from "react-native"
import { useRouter } from "expo-router"
import { MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons"
import { PremiumCard } from "@/src/components/ui/PremiumCard"
import { useThemeColors } from "@/src/constants/Colors"

interface ActionButtonProps {
  icon: any
  iconType: 'mci' | 'fa5' | 'feather'
  label: string
  color: string
  onPress: () => void
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  iconType,
  label,
  color,
  onPress,
}) => {
  const IconComponent = iconType === 'mci' ? MaterialCommunityIcons : 
                        iconType === 'fa5' ? FontAwesome5 : Feather;

  return (
    <View className="flex-1 min-w-[100px] h-28 m-1">
      <PremiumCard 
        onPress={onPress}
        gradientColors={[`${color}20`, `${color}05`]}
        containerStyle="items-center justify-center border-white/5"
      >
        <View className="items-center justify-center">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: `${color}15` }}
          >
            <IconComponent
              name={icon}
              size={24}
              color={color}
            />
          </View>
          <Text className="text-text/90 text-xs font-bold uppercase tracking-tight">{label}</Text>
        </View>
      </PremiumCard>
    </View>
  )
}

export default function ActionButtons() {
  const router = useRouter()
  const colors = useThemeColors()

  return (
    <View className="flex-row flex-wrap justify-between px-1">
      <ActionButton
        icon="weight"
        iconType="fa5"
        label="Weight"
        color={colors.statSecondary}
        onPress={() => router.push("/(drawer)/(tabs)/weights/add")}
      />
      <ActionButton
        icon="dumbbell"
        iconType="fa5"
        label="Workout"
        color={colors.statQuaternary}
        onPress={() => router.push("/(drawer)/(tabs)/workouts/add")}
      />
      <ActionButton
        icon="check-circle"
        iconType="feather"
        label="Task"
        color={colors.primary}
        onPress={() => router.push("/(drawer)/(tabs)/tasks")}
      />
    </View>
  )
}

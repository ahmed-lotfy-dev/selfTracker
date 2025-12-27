import { View, Text, ScrollView } from "react-native"
import React from "react"
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  colorClass: string
}

const getBgClass = (colorClass: string) => {
  // Map text colors to their background counterparts using theme opacity
  const map: Record<string, string> = {
    "text-primary": "bg-primary/10",
    "text-blue-500": "bg-blue-500/10",
    "text-purple-500": "bg-purple-500/10",
    "text-indigo-500": "bg-indigo-500/10",
  }
  return map[colorClass] || "bg-background"
}


const StatCard = ({ label, value, icon, colorClass }: StatCardProps) => (
  <View
    className={`bg-card p-3 rounded-xl shadow-sm mr-3 min-w-[140px] border border-border flex-1`}
  >
    <View className={`p-2 rounded-full self-start mb-2 ${getBgClass(colorClass)}`}>
      {icon}
    </View>
    <Text className="text-2xl font-bold text-text">{value}</Text>
    <Text className="text-placeholder font-medium text-xs uppercase mt-1">{label}</Text>
  </View>
)

export interface WorkoutStatsRowProps {
  weeklyWorkouts: number
  monthlyWorkouts: number
  uniqueWorkoutsThisWeek: number
}

export function WorkoutStatsRow({ weeklyWorkouts, monthlyWorkouts, uniqueWorkoutsThisWeek }: WorkoutStatsRowProps) {
  const colors = useThemeColors()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row py-2 pl-2"
      contentContainerStyle={{ paddingRight: 32 }} // Extra padding at end
    >
      <StatCard
        label="This Week"
        value={weeklyWorkouts}
        icon={<FontAwesome5 name="dumbbell" size={16} color={colors.primary} />}
        colorClass="text-primary"
      />

      <StatCard
        label="This Month"
        value={monthlyWorkouts}
        icon={<MaterialIcons name="calendar-today" size={16} color="#6366f1" />}
        colorClass="text-indigo-500"
      />

      <StatCard
        label="Unique Types"
        value={uniqueWorkoutsThisWeek}
        icon={<MaterialIcons name="fitness-center" size={18} color="#a855f7" />}
        colorClass="text-purple-500"
      />
    </ScrollView>
  )
}

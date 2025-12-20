import { View, Text, ScrollView } from "react-native"
import React from "react"
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon: React.ReactNode
  colorClass: string
}

const getBgClass = (colorClass: string) => {
  const map: Record<string, string> = {
    "text-statPrimary": "bg-statPrimary/10",
    "text-statSecondary": "bg-statSecondary/10",
    "text-statTertiary": "bg-statTertiary/10",
    "text-statQuaternary": "bg-statQuaternary/10",
  }

  if (colorClass.includes("statPrimary")) return "bg-statPrimary/10"
  if (colorClass.includes("statSecondary")) return "bg-statSecondary/10"
  if (colorClass.includes("statTertiary")) return "bg-statTertiary/10"
  if (colorClass.includes("statQuaternary")) return "bg-statQuaternary/10"

  return "bg-background"
}

const StatCard = ({ label, value, subLabel, icon, colorClass }: StatCardProps) => (
  <View
    className={`bg-card p-4 rounded-xl shadow-sm mr-3 min-w-[140px] border border-border flex-1`}
  >
    <View className={`p-2 rounded-full self-start mb-3 ${getBgClass(colorClass)}`}>
      {icon}
    </View>
    <Text className="text-2xl font-bold text-text">{value}</Text>
    <Text className="text-placeholder font-medium text-xs uppercase mt-1">{label}</Text>
    {subLabel && <Text className="text-placeholder text-xs mt-1">{subLabel}</Text>}
  </View>
)

interface StatsRowProps {
  weeklyWorkouts: number
  monthlyWorkouts: number
  weightChange: string
  bmi: number | null
  goalWeight: number | null
}

export const StatsRow = ({
  weeklyWorkouts,
  monthlyWorkouts,
  weightChange,
  bmi,
  goalWeight,
}: StatsRowProps) => {
  const colors = useThemeColors()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row py-2"
      contentContainerStyle={{ paddingRight: 20 }}
    >
      <StatCard
        label="Weekly Workouts"
        value={weeklyWorkouts}
        icon={<FontAwesome5 name="dumbbell" size={16} color={colors.statPrimary} />}
        colorClass="text-statPrimary"
      />

      <StatCard
        label="Monthly Workouts"
        value={monthlyWorkouts}
        icon={<MaterialIcons name="calendar-today" size={16} color={colors.statSecondary} />}
        colorClass="text-statSecondary"
      />

      <StatCard
        label="Weight Change"
        value={weightChange || "N/A"}
        icon={<MaterialIcons name="monitor-weight" size={18} color={colors.statSecondary} />}
        colorClass="text-statSecondary"
      />

      {bmi && (
        <StatCard
          label="BMI"
          value={bmi.toFixed(1)}
          icon={<MaterialIcons name="accessibility" size={18} color={colors.statTertiary} />}
          colorClass="text-statTertiary"
        />
      )}

      {goalWeight && (
        <StatCard
          label="Goal Weight"
          value={`${goalWeight} kg`}
          icon={<MaterialIcons name="flag" size={18} color={colors.statQuaternary} />}
          colorClass="text-statQuaternary"
        />
      )}
    </ScrollView>
  )
}

import { View, Text, ScrollView } from "react-native"
import React from "react"
import { FontAwesome5, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  colorClass: string
}

const getBgClass = (colorClass: string) => {
  const map: Record<string, string> = {
    "text-primary": "bg-primary/10",
    "text-blue-500": "bg-blue-500/10",
    "text-purple-500": "bg-purple-500/10",
    "text-orange-500": "bg-orange-500/10",
    "text-green-500": "bg-green-500/10",
    "text-indigo-500": "bg-indigo-500/10",
  }
  return map[colorClass] || "bg-background"
}

const StatCard = ({ label, value, icon, colorClass }: StatCardProps) => (
  <View
    className={`bg-card p-4 rounded-xl shadow-sm mr-3 min-w-[140px] border border-border flex-1`}
  >
    <View className={`p-2 rounded-full self-start mb-3 ${getBgClass(colorClass)}`}>
      {icon}
    </View>
    <Text className="text-2xl font-bold text-text">{value}</Text>
    <Text className="text-placeholder font-medium text-xs uppercase mt-1">{label}</Text>
  </View>
)

interface WeightStatsRowProps {
  currentWeight: number | null
  weightChange: string
  bmi: number | null
  goalWeight: number | null
}

export const WeightStatsRow = ({
  currentWeight,
  weightChange,
  bmi,
  goalWeight,
}: WeightStatsRowProps) => {
  const colors = useThemeColors()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row py-2"
      contentContainerStyle={{ paddingRight: 20 }}
    >
      {currentWeight && (
        <StatCard
          label="Current Weight"
          value={`${currentWeight} kg`}
          icon={<FontAwesome5 name="weight" size={16} color={colors.primary} />}
          colorClass="text-primary"
        />
      )}

      <StatCard
        label="Total Change"
        value={weightChange || "N/A"}
        icon={<MaterialIcons name="trending-up" size={18} color="#a855f7" />}
        colorClass="text-purple-500"
      />

      {bmi && (
        <StatCard
          label="BMI"
          value={bmi.toFixed(1)}
          icon={<MaterialIcons name="accessibility" size={18} color="#f97316" />}
          colorClass="text-orange-500"
        />
      )}

      {goalWeight && (
        <StatCard
          label="Goal Weight"
          value={`${goalWeight} kg`}
          icon={<MaterialIcons name="flag" size={18} color="#22c55e" />}
          colorClass="text-green-500"
        />
      )}
    </ScrollView>
  )
}

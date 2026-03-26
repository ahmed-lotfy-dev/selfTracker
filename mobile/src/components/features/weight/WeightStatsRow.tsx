import { View, Text, ScrollView } from "react-native"
import React from "react"
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { PremiumCard } from "../../ui/PremiumCard"

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  colors: readonly [string, string, ...string[]]
}

const StatCard = ({ label, value, icon, colors }: StatCardProps) => (
  <View className="min-w-[140px] h-[100px] px-1">
    <PremiumCard
      gradientColors={colors}
      containerStyle="border-white/5"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="w-7 h-7 rounded-lg bg-white/10 items-center justify-center">
          {icon}
        </View>
        <Text className="text-white/40 font-black text-[8px] uppercase tracking-tighter">{label}</Text>
      </View>
      <View className="flex-1 justify-end">
        <Text className="text-xl font-black text-white tracking-tighter">{value}</Text>
      </View>
    </PremiumCard>
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
      className="flex-row py-1"
      contentContainerStyle={{ paddingHorizontal: 0 }}
    >
      {currentWeight && (
        <StatCard
          label="Current"
          value={`${currentWeight} kg`}
          icon={<FontAwesome5 name="weight" size={12} color="white" />}
          colors={[colors.statPrimary, `${colors.statPrimary}80`]}
        />
      )}

      <StatCard
        label="Change"
        value={weightChange || "0 kg"}
        icon={<MaterialIcons name="trending-up" size={14} color="white" />}
        colors={[colors.statQuaternary, `${colors.statQuaternary}80`]}
      />

      {bmi && (
        <StatCard
          label="BMI"
          value={bmi.toFixed(1)}
          icon={<MaterialIcons name="accessibility" size={14} color="white" />}
          colors={[colors.statTertiary, `${colors.statTertiary}80`]}
        />
      )}

      {goalWeight && (
        <StatCard
          label="Goal"
          value={`${goalWeight} kg`}
          icon={<MaterialIcons name="flag" size={14} color="white" />}
          colors={[colors.statSecondary, `${colors.statSecondary}80`]}
        />
      )}
    </ScrollView>
  )
}

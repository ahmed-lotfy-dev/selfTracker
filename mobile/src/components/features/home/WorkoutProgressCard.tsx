import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { MetricsCard } from "./MetricCard"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { CardHeader } from "./CardHeader"
import { WorkoutChart } from "./WorkoutChart"
import { useThemeColors } from "@/src/constants/Colors"

interface WorkoutProgressCardProps {
  weeklyWorkoutCount: number
  monthlyWorkoutCount: number
}

export const WorkoutProgressCard = ({
  weeklyWorkoutCount,
  monthlyWorkoutCount,
}: WorkoutProgressCardProps) => {
  const colors = useThemeColors()
  return (
    <View className="bg-card rounded-xl p-4 shadow-sm">
      <CardHeader title="Workouts" route="/workouts" />

      <View className="flex-row justify-between mb-3 mt-5">
        <View className="items-center flex-1">
          <FontAwesome5 name="dumbbell" size={20} color={colors.primary} />

          <Text className="text-2xl font-bold mt-1 text-text">{weeklyWorkoutCount}</Text>
          <Text className={"text-sm text-primary"}>weekly</Text>
        </View>
        <View className="items-center flex-1">
          <FontAwesome5 name="dumbbell" size={20} color={colors.primary} />

          <Text className="text-2xl font-bold mt-1 text-text">{monthlyWorkoutCount}</Text>
          <Text className={"text-sm text-primary"}>monthly</Text>
        </View>
      </View>

      <View className="mt-2">
        <WorkoutChart />
      </View>
    </View>
  )
}

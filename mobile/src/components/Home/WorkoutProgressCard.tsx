import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { MetricsCard } from "./MetricCard"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { CardHeader } from "./CardHeader"

interface WorkoutProgressCardProps {
  weeklyWorkoutCount: number
  monthlyWorkoutCount: number
}

export const WorkoutProgressCard = ({
  weeklyWorkoutCount,
  monthlyWorkoutCount,
}: WorkoutProgressCardProps) => {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <CardHeader title="Workouts" route="/workouts" />

      <View className="flex-row justify-between mb-3 mt-5">
        <View className="items-center flex-1">
          <FontAwesome5 name="dumbbell" size={24} className={"text-blue-500"} />

          <Text className="text-2xl font-bold mt-1">{weeklyWorkoutCount}</Text>
          <Text className={"text-sm text-blue-500"}>weekly</Text>
        </View>
        <View className="items-center flex-1">
          <FontAwesome5 name="dumbbell" size={24} className={"text-blue-500"} />

          <Text className="text-2xl font-bold mt-1">{monthlyWorkoutCount}</Text>
          <Text className={"text-sm text-blue-500"}>monthly</Text>
        </View>
      </View>
    </View>
  )
}

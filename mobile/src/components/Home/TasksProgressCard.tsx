import { View, Text, TouchableOpacity } from "react-native"
import React from "react"
import { MetricsCard } from "./MetricCard"
import { CardHeader } from "./CardHeader"

interface TasksProgressCardProps {
  weeklyPendingTaskCount: number
  weeklyCompletedTaskCount: number
}

export const TasksProgressCard = ({
  weeklyPendingTaskCount,
  weeklyCompletedTaskCount,
}: TasksProgressCardProps) => {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <CardHeader title="Tasks" route="/tasks"/>
      <View className="flex-row justify-between mt-4">
        <MetricsCard
          icon="check-circle"
          value={` ${weeklyCompletedTaskCount} / ${
            weeklyPendingTaskCount + weeklyCompletedTaskCount
          }`}
          label="Tasks Completed"
        />
      </View>
    </View>
  )
}

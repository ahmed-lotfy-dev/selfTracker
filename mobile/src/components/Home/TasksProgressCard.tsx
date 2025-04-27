import { View, Text } from "react-native"
import React from "react"
import { MetricsCard } from "./MetricCard"

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
      <Text className="text-lg font-semibold mb-3 ">Task Progress</Text>
      <View className="flex-row justify-between">
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

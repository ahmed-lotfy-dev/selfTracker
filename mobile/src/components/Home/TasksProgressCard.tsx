import { View, Text, TouchableOpacity } from "react-native"
import React from "react"
import { MetricsCard } from "./MetricCard"
import { CardHeader } from "./CardHeader"
import { allTasks } from "better-auth/react"

interface TasksProgressCardProps {
  pendingTasks: number
  completedTasks: number
  allTasks: number
}
console.log(allTasks)
export const TasksProgressCard = ({
  pendingTasks,
  completedTasks,
  allTasks,
}: TasksProgressCardProps) => {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <CardHeader title="Tasks" route="/tasks" />
      <View className="flex-row justify-between mt-4">
        <MetricsCard
          icon="check-circle"
          value={` ${completedTasks} / ${allTasks}`}
          label="Tasks Completed"
        />
      </View>
    </View>
  )
}

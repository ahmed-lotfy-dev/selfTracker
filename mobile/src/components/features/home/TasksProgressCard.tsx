import { View, Text, Pressable } from "react-native"
import React from "react"
import { MetricsCard } from "./MetricCard"
import { CardHeader } from "./CardHeader"
import { allTasks } from "better-auth/react"
import { TasksChart } from "./TasksChart"

interface TasksProgressCardProps {
  pendingTasks: number
  completedTasks: number
  allTasks: number
}

export const TasksProgressCard = ({
  pendingTasks,
  completedTasks,
  allTasks,
}: TasksProgressCardProps) => {
  return (
    <View className="bg-card rounded-xl p-4 shadow-sm">
      <CardHeader title="Tasks" route="/tasks" />
      <View className="flex-row justify-between mt-4">
        <MetricsCard
          icon="check-circle"
          value={` ${completedTasks} / ${allTasks}`}
          label="completed"
        />
      </View>
      <View className="mt-2">
        <TasksChart pendingTasks={pendingTasks} completedTasks={completedTasks} />
      </View>
    </View>
  )
}

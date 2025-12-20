import React from "react"
import { View, Text } from "react-native"
import { TaskType } from "@/src/types/taskType"
import { COLORS } from "@/src/constants/Colors"

interface TaskProgressProps {
  tasks: TaskType[]
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed
  const progress = total === 0 ? 0 : (completed / total) * 100

  return (
    <View className="flex-row items-center justify-between bg-card border border-border rounded-3xl p-5 mb-6 shadow-sm">
      <View>
        <Text className="text-text font-bold text-xl mb-1">Today's Progress</Text>
        <Text className="text-gray-500 dark:text-gray-400 font-medium text-sm">
          {completed} of {total} tasks completed
        </Text>
      </View>

      <View className="items-center justify-center">
        {/* Simple Ring Implementation (or just text for now to keep lightweight) */}
        <View className="w-16 h-16 rounded-full border-4 border-secondary/20 justify-center items-center bg-secondary/10">
          <Text className="text-primary font-bold text-sm">
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    </View>
  )
}

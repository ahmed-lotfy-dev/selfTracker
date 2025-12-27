import { View, Text, Dimensions } from "react-native"
import React, { useMemo } from "react"
import { PieChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { useTasksStore } from "@/src/stores/useTasksStore"

const SCREEN_WIDTH = Dimensions.get("window").width

export const TasksChart = () => {
  const colors = useThemeColors()
  const tasks = useTasksStore((s) => s.tasks)

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.deletedAt)
    const pendingTasks = activeTasks.filter((t) => !t.completed).length
    const completedTasks = activeTasks.filter((t) => t.completed).length
    return { pendingTasks, completedTasks }
  }, [tasks])

  const data = [
    {
      name: "Pending",
      population: stats.pendingTasks,
      color: colors.secondary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Done",
      population: stats.completedTasks,
      color: colors.primary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ]

  const hasData = stats.pendingTasks > 0 || stats.completedTasks > 0

  return (
    <View
      className="p-4 my-2 bg-card rounded-lg shadow-md border border-border"
      style={{ alignSelf: "center", width: "100%" }}
    >
      <Text
        style={{ marginBottom: 4, fontWeight: "bold", color: colors.primary }}
      >
        Tasks Overview
      </Text>
      {hasData ? (
        <PieChart
          data={data}
          width={SCREEN_WIDTH - 48}
          height={140}
          chartConfig={{
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <View className="items-center justify-center py-8">
          <Text className="text-placeholder text-center">
            No tasks yet. Add some tasks to see your progress!
          </Text>
        </View>
      )}
    </View>
  )
}

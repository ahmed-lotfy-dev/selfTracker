import { View, Text, Dimensions } from "react-native"
import React from "react"
import { PieChart } from "react-native-chart-kit"
import { COLORS, useThemeColors } from "@/src/constants/Colors"

const SCREEN_WIDTH = Dimensions.get("window").width

interface TasksChartProps {
  pendingTasks: number
  completedTasks: number
}

export const TasksChart = ({
  pendingTasks,
  completedTasks,
}: TasksChartProps) => {
  const colors = useThemeColors()

  const data = [
    {
      name: "Pending",
      population: pendingTasks,
      color: colors.secondary, // Emerald 400/600
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Done",
      population: completedTasks,
      color: colors.primary, // Emerald 500
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ]

  const hasData = pendingTasks > 0 || completedTasks > 0

  return (
    <View
      className="p-4 my-2 bg-card rounded-lg shadow-md border border-border"
      style={{ alignSelf: "center", width: "100%" }}
    >
      <Text
        style={{ marginBottom: 4, fontWeight: "bold", color: colors.primary }}
        className="text-primary"
      >
        Tasks Status
      </Text>

      {hasData ? (
        <PieChart
          data={data}
          width={SCREEN_WIDTH - 60}
          height={180}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (opacity = 1) => colors.text,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 0]}
          absolute
        />
      ) : (
        <Text className="mt-1 text-center pb-3 text-text-secondary">
          No tasks available. Add some tasks!
        </Text>
      )}
    </View>
  )
}

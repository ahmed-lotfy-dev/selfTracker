import { View, Text, Dimensions } from "react-native"
import React from "react"
import { PieChart } from "react-native-chart-kit"
import { COLORS } from "@/src/constants/Colors"

const SCREEN_WIDTH = Dimensions.get("window").width

interface TasksChartProps {
  pendingTasks: number
  completedTasks: number
}

export const TasksChart = ({
  pendingTasks,
  completedTasks,
}: TasksChartProps) => {
  const data = [
    {
      name: "Pending",
      population: pendingTasks,
      color: "#FCD34D", // yellow-400
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Done",
      population: completedTasks,
      color: "#34D399", // green-400
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ]

  const hasData = pendingTasks > 0 || completedTasks > 0

  return (
    <View
      className="p-4 my-2 bg-white rounded-lg shadow-md"
      style={{ alignSelf: "center", width: "100%" }}
    >
      <Text
        style={{ marginBottom: 4, fontWeight: "bold", color: COLORS.primary }}
      >
        Tasks Status
      </Text>

      {hasData ? (
        <PieChart
          data={data}
          width={SCREEN_WIDTH - 60}
          height={180}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 0]}
          absolute
        />
      ) : (
        <Text className="mt-1 text-center pb-3 text-gray-500">
          No tasks available. Add some tasks!
        </Text>
      )}
    </View>
  )
}

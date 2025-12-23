import { View, Text, Dimensions } from "react-native"
import React, { useMemo } from "react"
import { PieChart } from "react-native-chart-kit"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import { useCollections } from "@/src/db/collections"
import { useLiveQuery } from "@tanstack/react-db"

const SCREEN_WIDTH = Dimensions.get("window").width

export const TasksChart = () => {
  const colors = useThemeColors()
  const collections = useCollections()

  if (!collections) {
    return null
  }

  const { data: tasks = [] } = useLiveQuery((q: any) =>
    q.from({ tasks: collections.tasks })
      .select(({ tasks }: any) => ({
        id: tasks.id,
        completed: tasks.completed,
      }))
  ) ?? { data: [] }

  const stats = useMemo(() => {
    const pendingTasks = tasks.filter((t: any) => !t.completed).length
    const completedTasks = tasks.filter((t: any) => t.completed).length
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

import React, { useMemo } from "react"
import { View, Text } from "react-native"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { workoutLogCollection } from "@/src/db/collections"
import { BarChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"

export function WorkoutChart() {
  const colors = useThemeColors()

  const { data: allLogsData } = useLiveQuery((q) =>
    q.from({ logs: workoutLogCollection })
      .where(({ logs }) => eq(logs.deletedAt, null))
      .select(({ logs }) => logs)
  ) as { data: any[] }

  const allLogs = useMemo(() => allLogsData || [], [allLogsData])
  const screenWidth = Dimensions.get("window").width - 48

  const chartData = useMemo(() => {
    const typeMap = new Map<string, number>()

    allLogs.forEach(log => {
      const name = log.workoutName?.trim() || "Unknown"
      typeMap.set(name, (typeMap.get(name) || 0) + 1)
    })

    const sortedEntries = Array.from(typeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)

    if (sortedEntries.length === 0) {
      return { labels: [], datasets: [{ data: [0] }] }
    }

    return {
      labels: sortedEntries.map(e => e[0].substring(0, 8)),
      datasets: [{ data: sortedEntries.map(e => e[1]) }]
    }
  }, [allLogs])

  if (chartData.labels.length === 0) {
    return (
      <View className="h-[200px] items-center justify-center">
        <Text className="text-placeholder">No data to display</Text>
      </View>
    )
  }

  return (
    <BarChart
      data={chartData}
      width={screenWidth}
      height={200}
      yAxisLabel=""
      yAxisSuffix=""
      chartConfig={{
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: () => colors.placeholder,
        barPercentage: 0.6,
      }}
      style={{ marginLeft: -16, borderRadius: 16 }}
    />
  )
}

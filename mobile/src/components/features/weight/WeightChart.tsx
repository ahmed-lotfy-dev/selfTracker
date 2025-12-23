import React, { useMemo } from "react"
import { View, Text, Dimensions } from "react-native"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { weightLogCollection } from "@/src/db/collections"
import { LineChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { safeParseDate, formatLocal } from "@/src/lib/utils/dateUtils"

export function WeightChart() {
  const colors = useThemeColors()
  const { data: allLogs } = useLiveQuery((q) =>
    q.from({ logs: weightLogCollection })
      .where(({ logs }) => eq(logs.deletedAt, null))
      .select(({ logs }) => logs)
  ) as { data: any[] }
  const screenWidth = Dimensions.get("window").width - 48

  const chartData = useMemo(() => {
    if (!allLogs || !Array.isArray(allLogs)) return { labels: [], datasets: [{ data: [0] }] }
    const sortedLogs = [...allLogs]
      .filter(log => log.createdAt)
      .sort((a, b) => safeParseDate(a.createdAt).getTime() - safeParseDate(b.createdAt).getTime())
      .slice(-10)

    if (sortedLogs.length === 0) {
      return { labels: [], datasets: [{ data: [0] }] }
    }

    const labels = sortedLogs.map((log) => {
      return formatLocal(log.createdAt!, "M/d")
    })

    const data = sortedLogs.map((log) => parseFloat(log.weight) || 0)

    return { labels, datasets: [{ data }] }
  }, [allLogs])

  if (chartData.labels.length === 0) {
    return (
      <View className="h-[200px] items-center justify-center">
        <Text className="text-placeholder">No data to display</Text>
      </View>
    )
  }

  return (
    <LineChart
      data={chartData}
      width={screenWidth}
      height={200}
      chartConfig={{
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        labelColor: () => colors.placeholder,
        propsForDots: {
          r: "4",
          strokeWidth: "2",
          stroke: colors.primary,
        },
      }}
      bezier
      style={{ marginLeft: -16, borderRadius: 16 }}
    />
  )
}

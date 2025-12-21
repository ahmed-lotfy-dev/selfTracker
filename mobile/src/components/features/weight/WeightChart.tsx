import React, { useMemo } from "react"
import { View, Text } from "react-native"
import { useQuery } from "@livestore/react"
import { queryDb } from "@livestore/livestore"
import { tables } from "@/src/livestore/schema"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"

const allWeightLogs$ = queryDb(
  () => tables.weightLogs.where({ deletedAt: null }),
  { label: 'weightLogsChart' }
)

export function WeightChart() {
  const colors = useThemeColors()
  const allLogs = useQuery(allWeightLogs$)
  const screenWidth = Dimensions.get("window").width - 48

  const chartData = useMemo(() => {
    const sortedLogs = [...allLogs]
      .filter(log => log.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
      .slice(-10)

    if (sortedLogs.length === 0) {
      return { labels: [], datasets: [{ data: [0] }] }
    }

    const labels = sortedLogs.map((log) => {
      const d = new Date(log.createdAt!)
      return `${d.getMonth() + 1}/${d.getDate()}`
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

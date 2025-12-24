import React, { useMemo, useState } from "react"
import { View, Text, Pressable, ScrollView } from "react-native"
import { useLiveQuery } from "@tanstack/react-db"
import { useCollections } from "@/src/db/collections"
import { BarChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { safeParseDate } from "@/src/lib/utils/dateUtils"
import { subMonths } from "date-fns"

const PERIODS = [
  { label: '1M', value: 1 },
  { label: '2M', value: 2 },
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: '1Y', value: 12 },
]

export function WorkoutChart() {
  const colors = useThemeColors()
  const [period, setPeriod] = useState(1)

  const collections = useCollections()
  if (!collections) return null

  const { data: allLogs = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.workoutLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        workoutName: logs.workout_name,
        createdAt: logs.created_at,
      }))
  ) ?? { data: [] }

  const screenWidth = Dimensions.get("window").width - 48

  const chartData = useMemo(() => {
    const typeMap = new Map<string, number>()
    const cutoffDate = subMonths(new Date(), period)

    const filteredLogs = allLogs.filter(log => {
      if (!log.createdAt) return false
      return safeParseDate(log.createdAt) >= cutoffDate
    })

    filteredLogs.forEach(log => {
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
  }, [allLogs, period])

  return (
    <View>
      <View className="px-1 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {PERIODS.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-full border ${period === p.value
                ? "bg-primary border-primary"
                : "bg-card border-border"
                }`}
            >
              <Text
                className={`text-xs font-semibold ${period === p.value ? "text-white" : "text-placeholder"
                  }`}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {chartData.labels.length === 0 ? (
        <View className="h-[200px] items-center justify-center">
          <Text className="text-placeholder">No data for this period</Text>
        </View>
      ) : (
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
      )}
    </View>
  )
}

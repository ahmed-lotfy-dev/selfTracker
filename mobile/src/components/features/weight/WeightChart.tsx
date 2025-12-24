import React, { useMemo, useState } from "react"
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native"
import { useLiveQuery } from "@tanstack/react-db"
import { useCollections } from "@/src/db/collections"
import { LineChart } from "react-native-chart-kit"
import { useThemeColors } from "@/src/constants/Colors"
import { safeParseDate, formatLocal } from "@/src/lib/utils/dateUtils"
import { subMonths } from "date-fns"

const PERIODS = [
  { label: '1M', value: 1 },
  { label: '2M', value: 2 },
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: '1Y', value: 12 },
]

export function WeightChart() {
  const colors = useThemeColors()
  const [period, setPeriod] = useState(1)

  const collections = useCollections()
  if (!collections) return null

  const { data: allLogs = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.weightLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        weight: logs.weight,
        createdAt: logs.created_at,
      }))
  ) ?? { data: [] }

  const screenWidth = Dimensions.get("window").width - 48

  const chartData = useMemo(() => {
    if (!allLogs || !Array.isArray(allLogs)) return { labels: [], datasets: [{ data: [0] }] }

    const cutoffDate = subMonths(new Date(), period)

    const sortedLogs = [...allLogs]
      .filter(log => {
        if (!log.createdAt) return false
        return safeParseDate(log.createdAt) >= cutoffDate
      })
      .sort((a, b) => safeParseDate(a.createdAt).getTime() - safeParseDate(b.createdAt).getTime())

    if (sortedLogs.length === 0) {
      return { labels: [], datasets: [{ data: [0] }] }
    }

    // Determine how many labels to show to prevent overcrowding
    // For 1 month, show almost all (up to 15). For 1 year, show monthly or sparse points.
    const maxLabels = 7
    const step = Math.ceil(sortedLogs.length / maxLabels)

    const labels = sortedLogs.map((log, index) => {
      if (index % step === 0 || index === sortedLogs.length - 1) {
        return formatLocal(log.createdAt!, "M/d")
      }
      return ""
    })

    const data = sortedLogs.map((log) => parseFloat(log.weight) || 0)

    return { labels, datasets: [{ data }] }
  }, [allLogs, period])

  return (
    <View>
      <View className="px-4 mb-4">
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
      )}
    </View>
  )
}

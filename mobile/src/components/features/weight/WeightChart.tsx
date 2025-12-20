import { View, Text, Dimensions } from "react-native"
import React, { useState } from "react"
import { LineChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchWeightLogsChart } from "@/src/lib/api/weightsApi"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import ActivitySpinner from "@/src/components/ActivitySpinner"

const SCREEN_WIDTH = Dimensions.get("window").width

const CHART_HEIGHT = 250 // Fixed height including padding

export const WeightChart = () => {
  const [month, setMonth] = useState<number>(3)
  const colors = useThemeColors()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["weightLogsChartData", month],
    queryFn: () => fetchWeightLogsChart(month),
    staleTime: 1000 * 60 * 5,
  })

  const ranges = [
    { label: "1M", value: 1 },
    { label: "3M", value: 3 },
    { label: "6M", value: 6 },
    { label: "1Y", value: 12 },
  ]

  if (isLoading || !data) {
    return (
      <View
        className="justify-center items-center p-4 bg-card"
        style={{ height: CHART_HEIGHT }}
      >
        <ActivitySpinner size="large" color={colors.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View
        className="justify-center items-center p-4 bg-card"
        style={{ height: CHART_HEIGHT }}
      >
        <Text className="text-error text-center">
          Error loading chart.
        </Text>
      </View>
    )
  }

  const noChartData =
    !data ||
    !data.labels?.length ||
    !data.datasets?.[0]?.data?.length ||
    data.datasets[0].data.every(
      (val: any) => typeof val !== "number" || isNaN(val)
    )

  return (
    <View className="bg-card">
      {/* Time Stats Header */}
      <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
        <Text className="font-bold text-text">Trend</Text>
        <View className="flex-row gap-2">
          {ranges.map((r) => (
            <Text
              key={r.value}
              onPress={() => setMonth(r.value)}
              className={`text-xs font-bold px-2 py-1 rounded-full overflow-hidden ${month === r.value ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}
            >
              {r.label}
            </Text>
          ))}
        </View>
      </View>

      {noChartData ? (
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          <Text className="text-gray-400 text-center px-6">
            No weight logs found for this period.
          </Text>
        </View>
      ) : (
        <LineChart
          data={data}
          width={SCREEN_WIDTH - 32} // Parent padding
          height={220}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 1,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.text,
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.primary
            },
            propsForBackgroundLines: {
              strokeDasharray: "5", // dashed
              stroke: colors.border
            }
          }}
          bezier
          withDots={true}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          yAxisSuffix="kg"
          style={{
            marginTop: 10,
            borderRadius: 16
          }}
        />
      )}
    </View>
  )
}

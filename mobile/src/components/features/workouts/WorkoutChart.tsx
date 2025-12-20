import { View, Text, Dimensions } from "react-native"
import React, { useState } from "react"
import { BarChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkoutLogsChart } from "@/src/lib/api/workoutsApi"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import ActivitySpinner from "@/src/components/ActivitySpinner"

const SCREEN_WIDTH = Dimensions.get("window").width
const CHART_HEIGHT = 280

export const WorkoutChart = () => {
  const [month, setMonth] = useState(3)
  const colors = useThemeColors()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workoutLogsChartData", month],
    queryFn: () => fetchWorkoutLogsChart(month),
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
        <Text className="font-bold text-text">Frequency</Text>
        <View className="flex-row gap-2">
          {ranges.map((r) => (
            <Text
              key={r.value}
              onPress={() => setMonth(r.value)}
              className={`text-xs font-bold px-2 py-1 rounded-full overflow-hidden ${month === r.value ? 'bg-primary/20 text-primary' : 'text-placeholder'}`}
            >
              {r.label}
            </Text>
          ))}
        </View>
      </View>

      {noChartData ? (
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          <Text className="text-placeholder text-center px-6">
            No workouts found for this period.
          </Text>
        </View>
      ) : (
        <BarChart
          data={data}
          width={SCREEN_WIDTH - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary, // Use theme primary color
            labelColor: (opacity = 1) => colors.text, // Use theme text color
            propsForBackgroundLines: {
              strokeDasharray: "5",
              stroke: colors.border // Use theme border color
            }
          }}
          style={{
            marginTop: 10,
            borderRadius: 16
          }}
          fromZero={true}
          showBarTops={false}
          showValuesOnTopOfBars={true}
          segments={4}
        />
      )}
    </View>
  )
}


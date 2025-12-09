import { View, Text, Dimensions } from "react-native"
import React, { useState } from "react"
import { BarChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkoutLogsChart } from "@/src/lib/api/workoutsApi"
import { COLORS } from "@/src/constants/Colors"
import ActivitySpinner from "../ActivitySpinner"

const SCREEN_WIDTH = Dimensions.get("window").width
const CHART_HEIGHT = 280

export const WorkoutChart = () => {
  const [month, setMonth] = useState(3)

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
        className="justify-center items-center p-4 bg-white"
        style={{ height: CHART_HEIGHT }}
      >
        <ActivitySpinner size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
        <View
        className="justify-center items-center p-4 bg-white"
        style={{ height: CHART_HEIGHT }}
      >
        <Text className="text-red-500 text-center">
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
    <View className="bg-white">
        {/* Time Stats Header */}
        <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
            <Text className="font-bold text-gray-700">Frequency</Text>
             <View className="flex-row gap-2">
                {ranges.map((r) => (
                    <Text 
                        key={r.value}
                        onPress={() => setMonth(r.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full overflow-hidden ${month === r.value ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
                    >
                        {r.label}
                    </Text>
                ))}
             </View>
        </View>

      {noChartData ? (
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          <Text className="text-gray-400 text-center px-6">
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
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
               propsForBackgroundLines: {
                  strokeDasharray: "5",
                  stroke: "#e5e7eb"
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


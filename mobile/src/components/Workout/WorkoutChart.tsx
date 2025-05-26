import { View, Text, ActivityIndicator, Dimensions } from "react-native"
import React, { useState } from "react"
import { BarChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkoutLogsChart } from "@/src/lib/api/workoutsApi"
import { COLORS } from "@/src/constants/Colors"

const SCREEN_WIDTH = Dimensions.get("window").width
const CHART_HEIGHT = 280

export const WorkoutChart = () => {
  const [month, setMonth] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workoutLogsChartData", month],
    queryFn: () => fetchWorkoutLogsChart(month),
    staleTime: 1000 * 60 * 5,
  })

  return (
    <View
      style={{
        height: CHART_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      {isLoading || !data ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : isError ? (
        <Text className="text-red-500 text-center">
          Error loading chart data. Please try again later.
        </Text>
      ) : data?.labels?.length > 0 ? (
        <>
          <Text className="my-2 font-bold text-blue-500">
            Workouts for Month {month}
          </Text>
          <BarChart
            data={data}
            width={SCREEN_WIDTH - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#f9f9f9",
              backgroundGradientTo: "#f9f9f9",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "gray",
            }}
            fromZero={true}
            segments={5}
          />
        </>
      ) : (
        <Text className="text-center text-gray-500 mt-4">
          No workout data found for this month.
        </Text>
      )}
    </View>
  )
}

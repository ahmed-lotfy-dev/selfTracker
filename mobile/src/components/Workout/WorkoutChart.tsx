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
  const [month, setMonth] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workoutLogsChartData", month],
    queryFn: () => fetchWorkoutLogsChart(month),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading || !data) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{
          height: CHART_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <ActivitySpinner size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{
          height: CHART_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text className="text-red-500 text-center">
          Error loading chart data. Please try again later.
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
    <View
      className="p-4 my-2 bg-white rounded-lg shadow-md"
      style={{
        justifyContent: "center",
        padding: 16,
      }}
    >
      {noChartData ? (
        <Text className="mt-1 text-center pb-3">
          No Workout logs found this month. Start tracking to see your progress!
        </Text>
      ) : (
        <>
          <Text className="my-2 font-bold text-blue-500">
            Workouts for Month {month}
          </Text>
          <BarChart
            data={data}
            width={SCREEN_WIDTH - 70}
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
      )}
    </View>
  )
}

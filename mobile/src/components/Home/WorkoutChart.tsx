import { View, Text, Dimensions } from "react-native"
import React, { useState } from "react"
import { BarChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkoutLogsChart } from "@/src/lib/api/workoutsApi"
import { COLORS } from "@/src/constants/Colors"
import ActivitySpinner from "../ActivitySpinner"

const SCREEN_WIDTH = Dimensions.get("window").width

const CHART_HEIGHT = 250 // Fixed height including padding

export const WorkoutChart = () => {
  const [month, setMonth] = useState<number>(3) // Default to 3 months? Or 1? Backend defaults to 3 if not provided but here we pass 3.

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workoutLogsChartData", month],
    queryFn: () => fetchWorkoutLogsChart(month),
    staleTime: 1000 * 60 * 5,
  })

  // Basic check for empty data
  // data should be { labels: [], datasets: [{ data: [] }] }
  const noChartData =
    !data ||
    !data.labels?.length ||
    !data.datasets?.[0]?.data?.length ||
    data.datasets[0].data.every((val: any) => val === 0)

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ height: CHART_HEIGHT }}
      >
        <ActivitySpinner size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ height: CHART_HEIGHT }}
      >
        <Text className="text-red-500 text-center">
          Error loading chart data.
        </Text>
      </View>
    )
  }

  return (
    <View
      className="p-4 my-2 bg-white rounded-lg shadow-md"
      style={{ alignSelf: "center" }}
    >
      <Text
        style={{ marginBottom: 8, fontWeight: "bold", color: COLORS.primary }}
      >
        Workout Frequency (Last {month} Months)
      </Text>

      {noChartData ? (
        <Text className="mt-1 text-center pb-3">
          No workout logs found. Get moving!
        </Text>
      ) : (
        <BarChart
          data={data}
          width={SCREEN_WIDTH - 60}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f9f9f9",
            backgroundGradientTo: "#f9f9f9",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue color
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.7,
          }}
          style={{
            borderRadius: 6,
          }}
          fromZero
          showValuesOnTopOfBars
        />
      )}
    </View>
  )
}

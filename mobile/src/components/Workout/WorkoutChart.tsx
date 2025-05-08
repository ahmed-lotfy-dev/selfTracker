import { View, Text } from "react-native"
import React, { useState } from "react"
import { BarChart } from "react-native-chart-kit"
import { useQuery } from "@tanstack/react-query"
import { fetchWorkoutLogsChart } from "@/src/lib/api/workoutsApi"

export const WorkoutChart = () => {
  const [month, setMonth] = useState<number>(1)

  const { data } = useQuery({
    queryKey: ["workoutLogsChartData", month],
    queryFn: () => fetchWorkoutLogsChart(month),
    staleTime: 1000 * 60 * 5,
  })

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="my-2 font-bold text-blue-500">
        Workouts for Month {month}
      </Text>

      {data && data.labels?.length > 0 ? (
        <BarChart
          data={data}
          width={320}
          height={220}
          yAxisLabel=""
          yAxisSuffix="x"
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
        />
      ) : (
        <Text className="text-center text-gray-500 mt-4">
          No workout data found for this month.
        </Text>
      )}
    </View>
  )
}

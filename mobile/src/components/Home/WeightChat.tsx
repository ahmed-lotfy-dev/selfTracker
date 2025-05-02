import { View, Text } from "react-native"
import React from "react"
import { LineChart } from "react-native-chart-kit"

interface WeightLog {
  weight: string
  date: string
}

interface weightChartProps {
  weightLogs: WeightLog[]
}

export const WeightChart = ({ weightLogs }: weightChartProps) => {
  return (
    <View className="flex-1 justify-center items-center">
      {weightLogs.length > 0 ? (
        <LineChart
          data={{
            labels: weightLogs
              .map((log) => log.date)
              .filter(
                (_, index, array) => index % Math.ceil(array.length / 3) === 0
              ),
            datasets: [
              {
                data: weightLogs.map((log) => parseFloat(log.weight)),
              },
            ],
          }}
          width={320}
          height={200}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f9f9f9",
            backgroundGradientTo: "#f9f9f9",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      ) : (
        <Text className="text-center text-gray-500 mt-4">
          No weight logs found. Start tracking to see progress.
        </Text>
      )}
    </View>
  )
}

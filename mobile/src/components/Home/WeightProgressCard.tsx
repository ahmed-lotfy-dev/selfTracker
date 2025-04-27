// src/components/Dashboard/WeightProgressCard.tsx
import { View, Text } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { MetricsCard } from "./MetricCard"

interface WeightProgressCardProps {
  currentWeight: number | null
  goalWeight: number | null
  delta: number | null
}

export const WeightProgressCard = ({
  currentWeight,
  goalWeight,
  delta,
}: WeightProgressCardProps) => {
  const isProgressGood = delta !== null ? delta <= 0 : false
  const deltaText =
    delta !== null
      ? `${delta > 0 ? "+" : ""}${Math.abs(delta).toFixed(1)} kg`
      : "N/A"

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <Text className="text-lg font-semibold mb-3 ">Weight Progress</Text>

      <View className="flex-row justify-between mb-3">
        <MetricsCard
          icon="monitor-weight"
          value={currentWeight ? `${currentWeight} kg` : "N/A"}
          label="Current"
        />
        <MetricsCard
          icon="flag"
          value={goalWeight ? `${goalWeight} kg` : "Not set"}
          label="Goal"
        />
      </View>

      {delta !== null && (
        <View className="flex-row items-center justify-center mt-2">
          <MaterialIcons
            name={isProgressGood ? "trending-up" : "trending-down"}
            size={24}
            color={isProgressGood ? "#10b981" : "#ef4444"}
          />
          <Text
            className={`ml-2 font-semibold ${
              isProgressGood ? "text-green-500" : "text-red-500"
            }`}
          >
            {deltaText}
          </Text>
        </View>
      )}
    </View>
  )
}

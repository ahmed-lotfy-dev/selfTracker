// src/components/Dashboard/WeightProgressCard.tsx
import { View, Text } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { MetricsCard } from "./MetricCard"
import { CardHeader } from "./CardHeader"
import { LineChart } from "react-native-chart-kit"
import { WeightChart } from "../Weight/WeightChart"
import React from "react"

interface WeightProgressCardProps {
  weightChange: string
  goalWeight: number | null
  delta: number | null
  bmi: number | null
  weightLogs?: { weight: string; date: string }[]
}

export const WeightProgressCard = ({
  weightChange,
  goalWeight = null,
  delta = null,
  bmi = null,
  weightLogs = [],
}: WeightProgressCardProps) => {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <CardHeader title="Weights" route="/weights" />

      <View className="flex-row justify-between mb-3 mt-4">
        <MetricsCard
          icon="monitor-weight"
          value={weightChange ? weightChange.toLocaleLowerCase() : "N/A"}
          label="3 months"
        />
        <MetricsCard
          icon="flag"
          value={goalWeight ? `${goalWeight} kg` : "Not set"}
          label="goal"
        />
      </View>
      <View className="mt-2">
        <WeightChart />
      </View>
    </View>
  )
}

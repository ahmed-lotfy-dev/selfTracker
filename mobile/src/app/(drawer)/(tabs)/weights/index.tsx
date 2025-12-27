import { View, Text } from "react-native"
import AddButton from "@/src/components/Buttons/AddButton"
import React, { useMemo } from "react"
import { WeightLogsList } from "@/src/components/features/weight/WeightLogsList"
import { WeightStatsRow } from "@/src/components/features/weight/WeightStatsRow"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import { useWeightStore } from "@/src/stores/useWeightStore"

export default function WeightsScreen() {
  const weightLogs = useWeightStore(s => s.weightLogs)

  const stats = useMemo(() => {
    // Assumptions: logs are not guaranteed to be sorted by date in store, 
    // but typically they might be. We should sort to be safe.
    const sortedLogs = [...weightLogs].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const currentLog = sortedLogs[0]
    const currentWeight = currentLog ? parseFloat(currentLog.weight) : null

    // Start weight is the oldest log
    const startLog = sortedLogs[sortedLogs.length - 1]
    const startWeight = startLog ? parseFloat(startLog.weight) : null

    let weightChange = "0 kg"
    if (currentWeight !== null && startWeight !== null) {
      const diff = currentWeight - startWeight
      const sign = diff > 0 ? "+" : ""
      weightChange = `${sign}${diff.toFixed(1)} kg`
    }

    return {
      currentWeight,
      weightChange,
      bmi: null, // Height is missing in store
      goalWeight: null // Goal is missing
    }
  }, [weightLogs])

  return (
    <View className="flex-1 bg-background px-3">
      <Header
        title="Weights"
        rightAction={<DrawerToggleButton />}
      />
      <View className="mb-4">
        <WeightStatsRow
          currentWeight={stats.currentWeight}
          weightChange={stats.weightChange}
          bmi={stats.bmi}
          goalWeight={stats.goalWeight}
        />
      </View>
      <WeightLogsList />
      <AddButton path="/weights" />
    </View>
  )
}

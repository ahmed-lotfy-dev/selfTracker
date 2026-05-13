import { View, StyleSheet } from "react-native"
import { LinearGradient } from 'expo-linear-gradient'
import AddButton from "@/src/components/Buttons/AddButton"
import React, { useMemo, useEffect } from "react"
import { WeightLogsList } from "@/src/components/features/weight/WeightLogsList"
import { WeightStatsRow } from "@/src/components/features/weight/WeightStatsRow"
import { WeightChart } from "@/src/components/features/weight/WeightChart"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import { useWeightStore } from "@/src/stores/useWeightStore"

export default function WeightsScreen() {
  const weightLogs = useWeightStore((s: any) => s.weightLogs)
  const fetchWeightLogs = useWeightStore((s: any) => s.fetchWeightLogs)

  useEffect(() => {
    fetchWeightLogs()
  }, [])

  const stats = useMemo(() => {
    const sortedLogs = [...weightLogs]
      .filter((l: any) => !l.deletedAt)
      .sort((a: any, b: any) =>
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

  const ListHeader = () => (
    <View className="pt-2">
      <View className="mb-4">
        <WeightStatsRow
          currentWeight={stats.currentWeight}
          weightChange={stats.weightChange}
          bmi={stats.bmi}
          goalWeight={stats.goalWeight}
        />
      </View>
      <View className="mb-4">
        <WeightChart />
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-background px-4">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <Header
        title="Weights"
        rightAction={<DrawerToggleButton />}
      />
      <View className="flex-1 mt-2">
        <WeightLogsList ListHeaderComponent={<ListHeader />} />
        <AddButton path="/home/weights" />
      </View>
    </View>
  )
}

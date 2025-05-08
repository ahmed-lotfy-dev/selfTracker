import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { fetchAllWeightLogs } from "@/src/lib/api/weightsApi"
import WeightLogItem from "@/src/components/Weight/WeightLogItem"
import Header from "@/src/components/Header"
import AddButton from "@/src/components/Buttons/AddButton"
import { COLORS } from "@/src/constants/Colors"
import React from "react"
import { fetchUserHomeInfo } from "@/src/lib/api/userApi"
import { WeightLogsList } from "@/src/components/Weight/WeightLogsList"

export default function WeightsScreen() {
  return (
    <View className="flex-1 px-4 relative">
      <WeightLogsList />
      <AddButton path="/weights" />
    </View>
  )
}

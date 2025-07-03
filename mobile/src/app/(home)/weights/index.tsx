import { ActivityIndicator, View } from "react-native"
import AddButton from "@/src/components/Buttons/AddButton"
import React from "react"
import { WeightLogsList } from "@/src/components/Weight/WeightLogsList"

export default function WeightsScreen() {
  return (
    <View className="flex-1 px-4 relative">
      <WeightLogsList />
      <AddButton path="/weights" />
    </View>
  )
}

import { ActivityIndicator, View } from "react-native"
import AddButton from "@/src/components/Buttons/AddButton"
import React from "react"
import { WeightLogsList } from "@/src/components/Weight/WeightLogsList"
import Header from "@/src/components/Header"

export default function WeightsScreen() {
  return (
    <View className="flex-1 px-4 mt-10 ">
      <Header title="Weights" backTo="/" />
      <WeightLogsList />
      <AddButton path="/weights" />
    </View>
  )
}

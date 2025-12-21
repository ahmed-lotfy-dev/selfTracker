import { View } from "react-native"
import AddButton from "@/src/components/Buttons/AddButton"
import React from "react"
import { WeightLogsList } from "@/src/components/features/weight/WeightLogsList"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"

export default function WeightsScreen() {
  return (
    <View className="flex-1 bg-background px-2">
      <Header
        title="Weights"
        rightAction={<DrawerToggleButton />}
      />
      <WeightLogsList />
      <AddButton path="/weights" />
    </View>
  )
}

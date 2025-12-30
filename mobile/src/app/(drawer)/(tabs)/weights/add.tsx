import React from "react"
import { ScrollView, View } from "react-native"
import WeightForm from "@/src/components/features/weight/WeightForm"
import { useRouter } from "expo-router"
import Header from "@/src/components/Header"

export default function AddWeight() {
  const router = useRouter()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-8 pb-32">
      <Header backTo="/weights" title={"Add Weight"} />
      <WeightForm />
    </ScrollView>
  )
}

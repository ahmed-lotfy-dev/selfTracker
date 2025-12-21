import { ScrollView, View } from "react-native"
import WeightForm from "@/src/components/features/weight/WeightForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import BackButton from "@/src/components/Buttons/BackButton"
import Header from "@/src/components/Header"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-8 pb-32">
      <Header backTo="/weights" title={"Add Weight"} />
      <WeightForm />
    </ScrollView>
  )
}

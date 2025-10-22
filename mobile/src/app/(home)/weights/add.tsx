import { ScrollView, View } from "react-native"
import WeightForm from "@/src/components/Weight/WeightForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import BackButton from "@/src/components/Buttons/BackButton"
import Header from "@/src/components/Header"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ScrollView style={{ flex: 1, marginVertical: 32 }}>
      <Header backTo="/weights"  title={"Add Weight"} />
      <WeightForm />
    </ScrollView>
  )
}

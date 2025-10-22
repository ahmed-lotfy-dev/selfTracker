import React from "react"
import { ScrollView, View } from "react-native"
import WeightForm from "@/src/components/Weight/WeightForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import Header from "@/src/components/Header"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ScrollView style={{ flex: 1, marginVertical: 32 }}>
      <Header backTo="/weights" title={"Edit Weight"} />
      <WeightForm isEditing={true} />
    </ScrollView>
  )
}

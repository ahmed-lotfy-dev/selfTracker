import { ScrollView, View } from "react-native"
import WeightForm from "@/src/components/Weight/WeightForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import BackButton from "@/src/components/Buttons/BackButton"

export default function AddWeight() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ScrollView style={{ flex: 1 }}>
      <BackButton backTo="/weights" className="ml-4" />
      <WeightForm />
    </ScrollView>
  )
}

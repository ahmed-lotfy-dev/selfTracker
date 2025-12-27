import React from "react"
import { ScrollView, View } from "react-native"
import WeightForm from "@/src/components/features/weight/WeightForm"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import Header from "@/src/components/Header"

export default function EditWeight() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-8 pb-32">
      <Header backTo={id ? `/weights/${id}` : "/weights"} title={"Edit Weight"} />
      <WeightForm isEditing={true} logId={id as string} />
    </ScrollView>
  )
}

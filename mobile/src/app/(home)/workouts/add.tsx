import { ScrollView, View } from "react-native"
import WorkoutForm from "@/src/components/Workout/WorkoutForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import React from "react"

export default function AddWorkout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <ScrollView style={{ flex: 1 }}>
      <WorkoutForm />
    </ScrollView>
  )
}

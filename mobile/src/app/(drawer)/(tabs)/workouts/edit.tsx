import { useLocalSearchParams } from "expo-router"

import { ScrollView } from "react-native"
import React from "react"
import Header from "@/src/components/Header"
import WorkoutForm from "@/src/components/features/workouts/WorkoutForm"

export default function EditWorkout() {
  const { id } = useLocalSearchParams()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-8 pb-32">
      <Header backTo={id ? `/workouts/${id}` : "/workouts"} title={"Edit Workout"} />
      <WorkoutForm isEditing={true} logId={id as string} />
    </ScrollView>
  )
}

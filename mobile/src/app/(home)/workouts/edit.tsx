import WorkoutForm from "@/src/components/features/workouts/WorkoutForm"

import { ScrollView } from "react-native"
import React from "react"
import Header from "@/src/components/Header"

export default function AddWorkout() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-8 pb-32">
      <Header backTo="/workouts" title={"Edit Workout"} />
      <WorkoutForm isEditing={true} />
    </ScrollView>
  )
}

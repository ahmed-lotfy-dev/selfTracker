import WorkoutForm from "@/src/components/Workout/WorkoutForm"

import { ScrollView } from "react-native"
import React from "react"
import Header from "@/src/components/Header"

export default function AddWorkout() {
  return (
    <ScrollView style={{ flex: 1, marginVertical: 32 }}>
      <Header backTo="/workouts" title={"Edit Workout"} />
      <WorkoutForm isEditing={true} />
    </ScrollView>
  )
}

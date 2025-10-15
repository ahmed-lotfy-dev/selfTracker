import WorkoutForm from "@/src/components/Workout/WorkoutForm"

import { ScrollView } from "react-native"
import React from "react"
import BackButton from "@/src/components/Buttons/BackButton"

export default function AddWorkout() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <BackButton backTo="/workouts" className="ml-4" />
      <WorkoutForm isEditing={true} />
    </ScrollView>
  )
}

import { ScrollView, View } from "react-native"
import WorkoutForm from "@/src/components/Workout/WorkoutForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import Header from "@/src/components/Header"

export default function AddWorkout() {
  return (
    <ScrollView style={{ flex: 1, marginVertical: 32 }}>
      <Header backTo="/workouts" title="Add Workout" />
      <WorkoutForm />
    </ScrollView>
  )
}

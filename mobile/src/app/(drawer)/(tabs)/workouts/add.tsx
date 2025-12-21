import { ScrollView, View } from "react-native"
import WorkoutForm from "@/src/components/features/workouts/WorkoutForm"
import { useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import Header from "@/src/components/Header"

export default function AddWorkout() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-8 pb-32">
      <Header backTo="/workouts" title="Add Workout" />
      <WorkoutForm />
    </ScrollView>
  )
}

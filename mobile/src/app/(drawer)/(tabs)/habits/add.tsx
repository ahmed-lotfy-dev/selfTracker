import { ScrollView, View } from "react-native"
import HabitForm from "@/src/components/features/habits/HabitForm"
import React from "react"
import Header from "@/src/components/Header"

export default function AddHabitPage() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="py-8 pb-32">
      <Header backTo="/habits" title="Add Habit" />
      <HabitForm />
    </ScrollView>
  )
}

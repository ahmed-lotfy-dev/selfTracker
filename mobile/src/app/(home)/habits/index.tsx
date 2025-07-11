import React from "react"
import { SafeAreaView, ScrollView } from "react-native"
import { HabitTracker } from "@/src/components/Habits/HabitTracker"

export default function HabitsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        <HabitTracker
          habitName="Drink Water"
          initialDates={["2025-07-10", "2025-07-08"]}
          onToggle={(date, completed) => {
            console.log(`Date ${date} marked as ${completed}`)
          }}
        />
        <HabitTracker habitName="Meditate" />
      </ScrollView>
    </SafeAreaView>
  )
}

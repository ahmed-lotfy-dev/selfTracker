import React, { useState } from "react"
import { View, Text, Pressable, ScrollView } from "react-native"
import { format, addDays, startOfWeek, isToday } from "date-fns"

import { Feather } from "@expo/vector-icons"

const daysInWeek = 7

type HabitTrackerProps = {
  habitName: string
  initialDates?: string[] // ISO strings where habit was completed
  onToggle?: (date: string, completed: boolean) => void
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habitName,
  initialDates = [],
  onToggle,
}) => {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday

  const [completedDates, setCompletedDates] = useState<Set<string>>(
    new Set(initialDates)
  )

  const days = Array.from({ length: daysInWeek }).map((_, i) =>
    addDays(weekStart, i)
  )

  const toggleDate = (date: Date) => {
    const iso = format(date, "yyyy-MM-dd")
    const updated = new Set(completedDates)

    if (completedDates.has(iso)) {
      updated.delete(iso)
      onToggle?.(iso, false)
    } else {
      updated.add(iso)
      onToggle?.(iso, true)
    }

    setCompletedDates(updated)
  }

  return (
    <View className="px-4 py-3 rounded-2xl bg-white shadow-sm mb-4">
      <Text className="text-xl font-semibold text-gray-900 mb-3">
        {habitName}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((date) => {
          const iso = format(date, "yyyy-MM-dd")
          const isChecked = completedDates.has(iso)
          const isCurrent = isToday(date)

          return (
            <Pressable
              key={iso}
              onPress={() => toggleDate(date)}
              className={`
                "w-12 h-16 mx-1 rounded-2xl items-center justify-center",
                ${
                  isChecked
                    ? "bg-emerald-500"
                    : isCurrent
                    ? "border-2 border-gray-400"
                    : "bg-gray-100"
                }
              )`}
            >
              <Text
                className={`
                  "text-sm font-medium mb-1",
                  ${isChecked ? "text-white" : "text-gray-700"}
                )`}
              >
                {format(date, "EEE")}
              </Text>
              {isChecked ? (
                <Feather name="check" size={20} color="#fff" />
              ) : (
                <View className="w-4 h-4 rounded-full bg-gray-300" />
              )}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

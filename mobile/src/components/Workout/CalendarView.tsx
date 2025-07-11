import { COLORS } from "@/src/constants/Colors"
import { fetchWorkoutLogsByMonth } from "@/src/lib/api/workoutsApi"
import { showAlert } from "@/src/lib/lib"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import React, { useState, useMemo } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import { MarkedDates } from "react-native-calendars/src/types"

type WorkoutLog = {
  id: string
  userId: string
  workoutId: string
  workoutName: string
  notes: string
  createdAt: string
  updatedAt: string
}

type WorkoutLogMap = Record<string, WorkoutLog[]> // from API

const CalendarView = () => {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const {
    data = {},
    isLoading,
    error,
  } = useQuery<WorkoutLogMap>({
    queryKey: ["workoutLogsCalendar"],
    queryFn: () => fetchWorkoutLogsByMonth(selectedYear, selectedMonth),
  })

  const markedDates: MarkedDates = useMemo(() => {
    const acc: MarkedDates = {}
    for (const date in data) {
      acc[date] = {
        selected: true,
        selectedColor: COLORS.primary || "#1A434E",
      }
    }
    return acc
  }, [data])

  const handleDayPress = (day: DateData) => {
    const logs = data[day.dateString]
    if (logs && logs.length > 0) {
      router.push(`/workouts/${logs[0].id}`)
    } else {
      showAlert("No Workouts", "No workouts logged for this day.")
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading workout logs...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error loading data</Text>
        <Text>{(error as Error).message}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        monthFormat="yyyy MM"
        onMonthChange={({ year, month }) => {
          setSelectedYear(year)
          setSelectedMonth(month)
        }}
        minDate="1900-01-01"
        maxDate="2100-12-31"
        current={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`}
        dayComponent={({ date, state }) => {
          if (!date) return null

          const logs = data[date.dateString] || []
          const isSelected = logs.length > 0
          const bgColor = isSelected ? COLORS.primary : "transparent"
          const textColor =
            state === "disabled" ? "#d1d5db" : isSelected ? "white" : "#111827"
          const workoutName = logs[0]?.workoutName

          return (
            <Pressable onPress={() => handleDayPress(date)}>
              <View style={styles.dayContainer}>
                <View style={[styles.dayCircle, { backgroundColor: bgColor }]}>
                  <Text style={{ color: textColor }}>{date.day}</Text>
                </View>
                {workoutName && (
                  <Text style={styles.workoutText} numberOfLines={1}>
                    {workoutName}
                  </Text>
                )}
              </View>
            </Pressable>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  dayCircle: {
    borderRadius: 999,
    height: 36,
    width: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  workoutText: {
    fontSize: 10,
    color: "#4B5563", // gray-600
    textAlign: "center",
    maxWidth: 40,
  },
})

export default CalendarView

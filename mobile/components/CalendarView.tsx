import { fetchWorkoutLogsByMonth } from "@/utils/api/workoutsApi"
import { showAlert } from "@/utils/lib"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { View, Text, ActivityIndicator, Alert } from "react-native"
import { Calendar, DateData } from "react-native-calendars" // Import DateData
import { MarkedDates } from "react-native-calendars/src/types" // Import MarkedDates type

const CalendarView = () => {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const { data, isLoading, error } = useQuery({
    queryKey: ["workoutLogsCalendar", selectedYear, selectedMonth],
    queryFn: () => fetchWorkoutLogsByMonth(selectedYear, selectedMonth),
    staleTime: 1000 * 60 * 10,
  })

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading workout logs...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading data</Text>
        <Text>{error.message}</Text>
      </View>
    )
  }

  const markedDates: MarkedDates = (data ? Object.keys(data) : []).reduce(
    (acc: MarkedDates, date: string) => {
      // Only mark dates that have workout logs
      if (data && data[date] && data[date].length > 0) {
        acc[date] = {
          marked: true,
          dotColor: "darkblue",
          selected: true,
          selectedColor: "darkgreen",
        }
      }
      return acc
    },
    {}
  )

  const handleDayPress = (day: DateData) => {
    const selectedDate = day.dateString
    const logsForDay = data?.[selectedDate] || []

    if (logsForDay.length > 0) {
      router.push(`/workouts/${selectedDate}`)
      // Or navigate to a detailed log screen
      router
    } else {
      showAlert("No Workouts", "No workouts logged for this day.")
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        monthFormat={"yyyy MM"}
        onMonthChange={(monthData: { year: number; month: number }) => {
          setSelectedYear(monthData.year)
          setSelectedMonth(monthData.month)
        }}
        minDate={"1900-01-01"}
        maxDate={"2100-12-31"}
        current={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`}
      />
    </View>
  )
}

export default CalendarView

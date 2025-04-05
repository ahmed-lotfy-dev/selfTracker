import { fetchWorkoutLogsByMonth } from "@/utils/api/workoutsApi"
import { showAlert } from "@/utils/lib"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import React, { useState, useMemo } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import { MarkedDates } from "react-native-calendars/src/types"

const CalendarView = () => {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const { data, isLoading, error } = useQuery({
    queryKey: ["workoutLogsCalendar", selectedYear, selectedMonth,],
    queryFn: () => fetchWorkoutLogsByMonth(selectedYear, selectedMonth),
    staleTime: 1000 * 60 * 10,
  })

  const dateToLogId: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {}

    if (data) {
      for (const logs of Object.values(data)) {
        for (const log of logs as any) {
          const localDate = new Date(log.createdAt)
          const formattedDate = localDate.toISOString().slice(0, 10) // Ensure date is in "YYYY-MM-DD" format
          map[formattedDate] = log.logId 
        }
      }
    }

    return map
  }, [data])

  const markedDates: MarkedDates = useMemo(() => {
    const acc: MarkedDates = {}
    for (const date in dateToLogId) {
      acc[date] = {
        selected: true,
        selectedColor: "darkgreen",
      }
    }
    return acc
  }, [dateToLogId])

  const handleDayPress = (day: DateData) => {
    const selectedDate = day.dateString
    const logId = dateToLogId[selectedDate]

    if (logId) {
      router.push(`/workouts/${logId}`)
    } else {
      showAlert("No Workouts", "No workouts logged for this day.")
    }
  }

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
        <Text>{(error as Error).message}</Text>
      </View>
    )
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
        dayComponent={({ date, state }: any) => {
          const isSelected = !!markedDates[date.dateString]?.selected
          const bgColor =
            markedDates[date.dateString]?.selectedColor || "transparent"
          const textColor =
            state === "disabled" ? "#d1d5db" : isSelected ? "white" : "#111827"

          return (
            <View
              style={{
                backgroundColor: bgColor,
                borderRadius: 999,
                height: 36,
                width: 36,
                justifyContent: "center",
                alignItems: "center",
                margin: 2,
              }}
            >
              <Text style={{ color: textColor }}>{date.day}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

export default CalendarView

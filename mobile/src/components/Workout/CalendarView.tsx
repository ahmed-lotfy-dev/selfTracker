import { COLORS } from "@/src/constants/Colors"
import { fetchWorkoutLogsByMonth } from "@/src/lib/api/workoutsApi"
import { showAlert } from "@/src/lib/lib"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import React, { useState, useMemo } from "react"
import { View, Text, ActivityIndicator, Pressable } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import { MarkedDates } from "react-native-calendars/src/types"
import { format } from "date-fns"

const CalendarView = () => {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const { data, isLoading, error } = useQuery({
    queryKey: ["workoutLogsCalendar", selectedYear, selectedMonth],
    queryFn: () => fetchWorkoutLogsByMonth(selectedYear, selectedMonth),
    staleTime: 1000 * 60 * 10,
  })

  const dateToId: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {}
    if (data) {
      for (const logs of Object.values(data)) {
        for (const log of logs as any) {
          const localDate = new Date(log.createdAt)
          const formattedDate = format(new Date(log.createdAt), "yyyy-MM-dd")
          map[formattedDate] = log.id
        }
      }
    }

    return map
  }, [data])

  const markedDates: MarkedDates = useMemo(() => {
    const acc: MarkedDates = {}
    for (const date in dateToId) {
      acc[date] = {
        selected: true,
        selectedColor: "#1A434E",
      }
    }
    return acc
  }, [dateToId])

  const handleDayPress = (day: DateData) => {
    const selectedDate = day.dateString
    const id = dateToId[selectedDate]
    if (id) {
      router.push(`/workouts/${id}`)
    } else {
      showAlert("No Workouts", "No workouts logged for this day.")
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
            <Pressable onPress={() => handleDayPress(date)}>
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
            </Pressable>
          )
        }}
      />
    </View>
  )
}

export default CalendarView

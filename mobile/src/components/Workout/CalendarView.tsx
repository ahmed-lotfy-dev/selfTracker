import { COLORS } from "@/src/constants/Colors"
import { fetchWorkoutLogsByMonth } from "@/src/lib/api/workoutsApi"
import { useQuery } from "@tanstack/react-query"
import React, { useState, useMemo } from "react"
import { View, Text } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { FlashList } from "@shopify/flash-list"
import WorkoutLogItem from "./WorkoutLogItem"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"

type WorkoutLog = {
  id: string
  userId: string
  workoutId: string
  workoutName: string
  notes: string
  createdAt: string
  updatedAt: string
}

type WorkoutLogMap = Record<string, WorkoutLog[]>

interface CalendarViewProps {
  headerElement?: React.ReactNode
}

const CalendarView = ({ headerElement }: CalendarViewProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))

  const {
    data = {},
    isLoading,
    error,
  } = useQuery<WorkoutLogMap>({
    queryKey: ["workoutLogsCalendar", selectedYear, selectedMonth],
    queryFn: () => fetchWorkoutLogsByMonth(selectedYear, selectedMonth),
  })

  // Format markers for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {}
    
    // Mark days with data
    Object.keys(data).forEach((date) => {
      marks[date] = {
        marked: true,
        dotColor: COLORS.primary || "#6366f1",
      }
    })

    // Highlight selected date
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.primary || "#6366f1",
      selectedTextColor: "white",
    }

    return marks
  }, [data, selectedDate])

  const selectedLogs = data[selectedDate] || []

  const renderHeader = (
      <View>
          {headerElement}
          <View className="bg-white shadow-sm rounded-3xl mx-2 mb-5 overflow-hidden pb-2">
            <Calendar
                key={`${selectedYear}-${selectedMonth}`}
                current={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
                onDayPress={(day: DateData) => {
                    setSelectedDate(day.dateString)
                }}
                onMonthChange={(month: DateData) => {
                    setSelectedYear(month.year)
                    setSelectedMonth(month.month)
                }}
                enableSwipeMonths={true}
                renderArrow={(direction) => (
                    <MaterialIcons 
                        name={direction === 'left' ? 'chevron-left' : 'chevron-right'} 
                        size={28} 
                        color={COLORS.primary || "#6366f1"} 
                    />
                )}
                markedDates={markedDates}
                theme={{
                    calendarBackground: 'white',
                    textSectionTitleColor: '#9ca3af',
                    selectedDayBackgroundColor: COLORS.primary || '#6366f1',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: COLORS.primary || '#6366f1',
                    dayTextColor: '#1f2937',
                    textDisabledColor: '#e5e7eb',
                    dotColor: COLORS.primary || '#6366f1',
                    selectedDotColor: '#ffffff',
                    arrowColor: COLORS.primary || '#6366f1',
                    monthTextColor: '#111827',
                    indicatorColor: COLORS.primary || '#6366f1',
                    textDayFontWeight: '600',
                    textMonthFontWeight: '900',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 15,
                    textMonthFontSize: 22,
                    textDayHeaderFontSize: 12,
                }}
            />
          </View>
          <View className="px-2">
            <Text className="text-2xl font-bold text-gray-900 mb-4 ml-1">
                {format(new Date(selectedDate), "EEEE, MMM dd")}
            </Text>
          </View>
      </View>
  )

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        {headerElement}
        <View className="flex-1 justify-center items-center">
            <ActivitySpinner size="large" color={COLORS.primary} />
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
         {headerElement}
         <View className="flex-1 justify-center items-center">
            <Text className="text-red-500">Error loading calendar data.</Text>
         </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
        <FlashList 
            ListHeaderComponent={renderHeader}
            data={selectedLogs}
            renderItem={({ item }) => <WorkoutLogItem item={item as any} path="/workouts" />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400 font-medium">No workouts on this day.</Text>
                </View>
            }
        />
    </View>
  )
}

export default CalendarView

import { COLORS } from "@/src/constants/Colors"
import { fetchWorkoutLogsByMonth } from "@/src/lib/api/workoutsApi"
import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { FlashList } from "@shopify/flash-list"
import WorkoutLogItem from "./WorkoutLogItem"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"
import { SyncStatus } from "@/src/db/schema"

type WorkoutLog = {
  id: string
  userId: string
  workoutId: string
  workoutName: string
  notes: string | null
  createdAt: string
  updatedAt: Date | null
  deletedAt: Date | null
  syncStatus: SyncStatus | null
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

  // Custom Day Component to show workout name
  const DayComponent = ({ date, state }: { date?: DateData; state?: string }) => {
    if (!date) return <View />
    const dateStr = date.dateString
    const logs = data[dateStr] || []
    const isSelected = dateStr === selectedDate
    const isToday = dateStr === format(new Date(), "yyyy-MM-dd")
    const hasWorkout = logs.length > 0

    // Get first workout name if exists
    const workoutName = hasWorkout ? logs[0].workoutName : null

    return (
      <Pressable
        onPress={() => setSelectedDate(dateStr)}
        className={`w-[45px] h-[55px] items-center justify-start pt-1 rounded-md active:opacity-70 ${isSelected ? "bg-emerald-800 shadow-md" :
            hasWorkout ? "bg-emerald-200" : "bg-transparent"
          }`}
      >
        <Text
          className={`text-sm font-semibold mb-0.5 ${isSelected ? "text-white" :
              isToday ? "text-emerald-700 font-bold" :
                state === 'disabled' ? "text-gray-300" : "text-gray-900"
            }`}
        >
          {date.day}
        </Text>

        {/* Workout Name Indicator */}
        {workoutName && (
          <View className="px-0.5 overflow-hidden w-full items-center">
            <Text
              className={`text-[9px] text-center leading-3 ${isSelected ? "text-emerald-100" : "text-emerald-900 font-bold"
                }`}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {workoutName}
            </Text>
          </View>
        )}
      </Pressable>
    )
  }

  const selectedLogs = data[selectedDate] || []

  const renderHeader = (
    <View>
      {headerElement}
      <View className="bg-white shadow-sm rounded-3xl mx-2 mb-5 overflow-hidden pb-4 pt-2">
        <Calendar
          key={`${selectedYear}-${selectedMonth}`}
          current={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
          onMonthChange={(month: DateData) => {
            setSelectedYear(month.year)
            setSelectedMonth(month.month)
          }}
          enableSwipeMonths={true}
          dayComponent={DayComponent}
          renderArrow={(direction) => (
            <MaterialIcons
              name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
              size={28}
              color={COLORS.primary || "#6366f1"}
            />
          )}
          theme={{
            calendarBackground: 'white',
            textSectionTitleColor: '#9ca3af',
            textDayHeaderFontWeight: '600',
            textMonthFontWeight: '900',
            textMonthFontSize: 20,
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
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-400 font-medium">No workouts logged.</Text>
          </View>
        }
      />
    </View>
  )
}

export default CalendarView

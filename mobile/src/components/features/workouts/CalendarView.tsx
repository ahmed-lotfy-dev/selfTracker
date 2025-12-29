import React, { useState, useMemo } from "react"
import { View, Text } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import { useThemeColors } from "@/src/constants/Colors"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { WorkoutLogsList } from "./WorkoutLogsList"
import { format } from "date-fns"

interface CalendarViewProps {
  headerElement?: React.ReactNode
  workoutLogs?: any[]
}

export default function CalendarView({ headerElement, workoutLogs: propLogs }: CalendarViewProps) {
  const colors = useThemeColors()
  const storeLogs = useWorkoutsStore(s => s.workoutLogs)
  const workoutLogs = propLogs || storeLogs
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {}

    // Mark days with workouts
    workoutLogs.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0]
      if (!marks[date]) {
        marks[date] = {
          marked: true,
          dotColor: colors.primary,
        }
      }
    })

    // Highlight selected date
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: '#ffffff',
    }

    return marks
  }, [workoutLogs, selectedDate, colors.primary])

  const selectedDayLogs = useMemo(() => {
    return workoutLogs.filter(log => {
      const logDate = new Date(log.createdAt).toISOString().split('T')[0]
      return logDate === selectedDate
    })
  }, [workoutLogs, selectedDate])

  return (
    <View className="flex-1">
      {/* 
        We wrap the content in a fragment-like structure for WorkoutLogsList 
        because WorkoutLogsList typically handles the ScrollView. 
        However, WorkoutLogsList expects to control the ScrollView.
        We can pass the calendar as a headerElement to reused WorkoutLogsList?
        
        The current WorkoutLogsList takes a headerElement and renders it inside its ScrollView.
        So we can construct the specific Calendar header and pass it.
      */}
      <WorkoutLogsList
        logs={selectedDayLogs}
        ListHeaderComponent={
          <View>
            {headerElement}
            <View className="mx-2 mb-4 bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
              <Calendar
                current={selectedDate}
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                theme={{
                  backgroundColor: colors.card,
                  calendarBackground: colors.card,
                  textSectionTitleColor: colors.text,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: colors.primary,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.placeholder,
                  dotColor: colors.primary,
                  selectedDotColor: '#ffffff',
                  arrowColor: colors.primary,
                  monthTextColor: colors.text,
                  indicatorColor: colors.primary,
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13,
                }}
              />
            </View>
            <View className="px-4 mb-2">
              <Text className="text-lg font-bold text-text">
                {format(new Date(selectedDate), "dd/MM/yyyy")}
              </Text>
              <Text className="text-sm text-placeholder">
                {selectedDayLogs.length} workout{selectedDayLogs.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        }
      />
    </View>
  )
}

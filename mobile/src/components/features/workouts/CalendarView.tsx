import React, { useState, useMemo, useEffect, useCallback } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import { useThemeColors } from "@/src/constants/Colors"
import { useWorkoutsStore, WorkoutLog } from "@/src/stores/useWorkoutsStore"
import { WorkoutLogsList } from "./WorkoutLogsList"
import { format } from "date-fns"

interface CalendarViewProps {
  headerElement?: React.ReactNode
  workoutLogs?: any[]
}

export default function CalendarView({ headerElement, workoutLogs: propLogs }: CalendarViewProps) {
  const colors = useThemeColors()
  const storeLogs = useWorkoutsStore(s => s.workoutLogs)
  const [calendarLogs, setCalendarLogs] = useState<WorkoutLog[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const allLogs = useMemo(() => {
    const combined = [...storeLogs, ...calendarLogs]
    const uniqueMap = new Map(combined.map(log => [log.id, log]))
    return Array.from(uniqueMap.values())
  }, [storeLogs, calendarLogs])

  const workoutLogs = propLogs || allLogs

  const fetchMonthData = useCallback(async (year: number, month: number) => {
    setIsLoadingMonth(true)
    try {
      const { getWorkoutLogsForMonth } = await import('@/src/lib/api/workoutLogsApi')
      const logs = await getWorkoutLogsForMonth(year, month)
      setCalendarLogs(prev => {
        const combined = [...prev, ...logs]
        const uniqueMap = new Map(combined.map(log => [log.id, log]))
        return Array.from(uniqueMap.values())
      })
    } catch (e) {
      console.error('Failed to fetch calendar month data:', e)
    } finally {
      setIsLoadingMonth(false)
    }
  }, [])

  useEffect(() => {
    fetchMonthData(currentYear, currentMonth)
  }, [])

  const handleMonthChange = useCallback((date: DateData) => {
    const year = date.year
    const month = date.month
    setCurrentYear(year)
    setCurrentMonth(month)
    fetchMonthData(year, month)
  }, [fetchMonthData])

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {}

    workoutLogs.forEach(log => {
      const date = new Date(log.createdAt).toISOString().split('T')[0]
      if (!marks[date]) {
        marks[date] = {
          marked: true,
          dotColor: colors.primary,
        }
      }
    })

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
      <WorkoutLogsList
        logs={selectedDayLogs}
        disablePagination
        ListHeaderComponent={
          <View>
            {headerElement}
            <View className="mx-2 mb-4 bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
              {isLoadingMonth && (
                <View className="absolute top-2 right-2 z-10">
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
              <Calendar
                current={selectedDate}
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                onMonthChange={handleMonthChange}
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


import React, { useState, useMemo, useEffect, useCallback } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import { useThemeColors } from "@/src/constants/Colors"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { WorkoutLogsList } from "./WorkoutLogsList"
import { format } from "date-fns"
import { PremiumCard } from "../../ui/PremiumCard"

interface CalendarViewProps {
  headerElement?: React.ReactNode
  workoutLogs?: any[]
}

export default function CalendarView({ headerElement, workoutLogs: propLogs }: CalendarViewProps) {
  const colors = useThemeColors()
  const storeLogs = useWorkoutsStore(s => s.workoutLogs)
  const [calendarLogs, setCalendarLogs] = useState<any[]>([])
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
          customStyles: {
            container: {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            }
          }
        }
      }
    })

    const today = new Date().toISOString().split('T')[0]
    
    // Style today if it's not selected
    if (selectedDate !== today) {
      if (!marks[today]) {
        marks[today] = {
          customStyles: {
            text: {
              color: colors.primary,
              fontWeight: '900',
            }
          }
        }
      } else {
        marks[today].customStyles.text = {
          color: colors.primary,
          fontWeight: '900',
        }
      }
    }

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      customStyles: {
        container: {
          backgroundColor: 'rgba(16, 185, 129, 0.2)', // Translucent primary
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        text: {
          color: 'white',
          fontWeight: '900',
        }
      }
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
            <View className="mb-4">
              <PremiumCard 
                containerStyle="p-2 border-white/5"
                gradientColors={['rgba(255,255,255,0.03)', 'transparent']}
              >
                {isLoadingMonth && (
                  <View className="absolute top-4 right-4 z-10">
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}
                <Calendar
                  current={selectedDate}
                  onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                  onMonthChange={handleMonthChange}
                  markedDates={markedDates}
                  markingType={'custom'}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: 'rgba(255,255,255,0.5)',
                    dayTextColor: 'white',
                    textDisabledColor: 'rgba(255,255,255,0.2)',
                    monthTextColor: 'white',
                    textDayFontWeight: '500',
                    textMonthFontWeight: '900',
                    textDayHeaderFontWeight: '800',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 10,
                  }}
                />
              </PremiumCard>
            </View>
            <View className="px-5 mb-4 mt-2">
              <Text className="text-white text-[10px] font-black uppercase tracking-[2px] mb-1">
                Selected Date
              </Text>
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-black text-white tracking-tighter mr-2">
                  {format(new Date(selectedDate), "dd MMM")}
                </Text>
                <Text className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  {format(new Date(selectedDate), "yyyy")} • {selectedDayLogs.length} WORKOUT{selectedDayLogs.length !== 1 ? 'S' : ''}
                </Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  )
}


import { useThemeColors } from "@/src/constants/Colors"
import React, { useState, useMemo } from "react"
import { View, Text, Pressable } from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { FlashList } from "@shopify/flash-list"
import WorkoutLogItem from "./WorkoutLogItem"
import { format } from "date-fns"
import { MaterialIcons } from "@expo/vector-icons"
import { safeParseDate } from "@/src/lib/utils/dateUtils"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { useCollections } from "@/src/db/collections"

type WorkoutLog = {
  id: string
  userId: string | null
  workoutId: string
  workoutName: string
  notes: string | null
  createdAt: Date | null
  updatedAt: Date | null
  deletedAt: Date | null
}

type WorkoutLogMap = Record<string, WorkoutLog[]>

interface CalendarViewProps {
  headerElement?: React.ReactNode
}

const CalendarView = ({ headerElement }: CalendarViewProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const colors = useThemeColors()

  const collections = useCollections()
  if (!collections) return null

  const { data: allLogsData = [] } = useLiveQuery((q: any) =>
    q.from({ logs: collections.workoutLogs })
      .select(({ logs }: any) => ({
        id: logs.id,
        workoutName: logs.workout_name,
        createdAt: logs.created_at,
        notes: logs.notes,
        userId: logs.user_id,
        workoutId: logs.workout_id,
      }))
  ) ?? { data: [] }

  const allLogs = useMemo(() => allLogsData || [], [allLogsData])

  const data = useMemo(() => {
    const grouped: WorkoutLogMap = {}

    allLogs.forEach((log) => {
      if (!log.createdAt) return
      const d = new Date(log.createdAt)
      if (d.getFullYear() !== selectedYear || d.getMonth() + 1 !== selectedMonth) return

      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(log as WorkoutLog)
    })

    return grouped
  }, [allLogs, selectedYear, selectedMonth])

  const DayComponent = ({ date, state }: { date?: DateData; state?: string }) => {
    if (!date) return <View />
    const dateStr = date.dateString
    const logs = data[dateStr] || []
    const isSelected = dateStr === selectedDate
    const isToday = dateStr === format(new Date(), "yyyy-MM-dd")
    const hasWorkout = logs.length > 0

    const workoutName = hasWorkout ? logs[0].workoutName : null

    return (
      <Pressable
        onPress={() => setSelectedDate(dateStr)}
        className={`w-[45px] h-[48px] items-center justify-start pt-1 rounded-md active:opacity-70 ${isSelected ? "bg-primary shadow-md" :
          hasWorkout ? "bg-primary/20" : "bg-transparent"
          }`}
      >
        <Text
          className={`text-sm font-semibold mb-0.5 ${isSelected ? "text-white" :
            isToday ? "text-primary font-bold" :
              state === 'disabled' ? "text-placeholder" : "text-text"
            }`}
        >
          {date.day}
        </Text>

        {workoutName && (
          <View className="px-0.5 overflow-hidden w-full items-center">
            <Text
              className={`text-[9px] text-center leading-3 ${isSelected ? "text-emerald-50" : "text-primary font-bold"
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
      <View className="bg-card shadow-sm rounded-3xl mx-2  overflow-hidden pb-4 pt-2">
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
              color={colors.primary}
            />
          )}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: colors.text,
            textDayHeaderFontWeight: '600',
            textMonthFontWeight: '900',
            textMonthFontSize: 20,
            monthTextColor: colors.text,
            arrowColor: colors.primary,
          }}
        />
      </View>
      <View className="px-2">
        <Text className="text-2xl font-bold text-text ml-1">
          {format(safeParseDate(selectedDate), "EEEE, MMM dd")}
        </Text>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      <FlashList
        ListHeaderComponent={renderHeader}
        data={selectedLogs}
        renderItem={({ item }) => <WorkoutLogItem item={item as any} path="/workouts" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-placeholder font-medium">No workouts logged.</Text>
          </View>
        }
      />
    </View>
  )
}

export default CalendarView

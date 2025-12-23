import React, { useState, useMemo } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import DatePicker from "@/src/components/DatePicker"
import DateDisplay from "@/src/components/DateDisplay"
import { useRouter } from "expo-router"
import { useSelectedWorkout } from "@/src/features/workouts/useWorkoutStore"
import { WorkoutLogSchema } from "@/src/types/workoutLogType"
import { useUser } from "@/src/features/auth/useAuthStore"
import { format } from "date-fns"
import { useThemeColors } from "@/src/constants/Colors"
import { formatLocal, formatUTC, safeParseDate } from "@/src/lib/utils/dateUtils"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { useCollections } from "@/src/db/collections"

import Button from "@/src/components/ui/Button"
import { Section } from "@/src/components/ui/Section"

export default function WorkoutForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const user = useUser()
  const selectedWorkout = useSelectedWorkout()
  const colors = useThemeColors()
  const collections = useCollections()
  if (!collections) return null

  const { data: allWorkoutsData = [] } = useLiveQuery((q: any) =>
    q.from({ workouts: collections.workouts })
      .select(({ workouts }: any) => ({
        id: workouts.id,
        name: workouts.name,
      }))
  ) ?? { data: [] }

  const allWorkouts = useMemo(() => allWorkoutsData || [], [allWorkoutsData])

  const defaultWorkouts = useMemo(() => {
    if (allWorkouts.length > 0) return allWorkouts
    return [
      { id: 'push', name: 'Push Day' },
      { id: 'pull', name: 'Pull Day' },
      { id: 'legs', name: 'Leg Day' },
      { id: 'upper', name: 'Upper Body' },
      { id: 'lower', name: 'Lower Body' },
      { id: 'cardio', name: 'Cardio' },
      { id: 'full', name: 'Full Body' },
    ]
  }, [allWorkouts])

  const [workoutId, setWorkoutId] = useState(
    isEditing ? selectedWorkout?.workoutId || "" : ""
  )
  const [notes, setNotes] = useState(
    isEditing ? selectedWorkout?.notes || "" : ""
  )
  const [createdAt, setCreatedAt] = useState(() => {
    return formatUTC(isEditing && selectedWorkout?.createdAt ? selectedWorkout.createdAt : new Date())
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDate, setShowDate] = useState(false)

  const handleSubmit = async () => {
    const workoutName = defaultWorkouts.find((w) => w.id === workoutId)?.name || ""

    const formData = {
      userId: user?.id,
      workoutId,
      workoutName,
      notes,
      createdAt,
    }

    const result = WorkoutLogSchema.safeParse(formData)

    if (!result.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        newErrors[issue.path[0]] = issue.message
      }
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && selectedWorkout) {
        await collections.workoutLogs.update(selectedWorkout.id!, (draft: any) => {
          draft.notes = notes
          draft.updated_at = new Date()
          draft.created_at = new Date(createdAt)
        })
      } else {
        await collections.workoutLogs.insert({
          id: crypto.randomUUID(),
          user_id: user?.id || "",
          workout_id: workoutId,
          workout_name: workoutName,
          notes,
          created_at: formatUTC(createdAt),
          deleted_at: null,
        })
      }
      router.push("/workouts")
    } catch (e) {
      console.error("Failed to save workout log:", e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1 px-4 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <Section title="Activity" error={errors.workoutId}>
          <View className="flex-row items-center py-2 px-4">
            <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mr-3">
              <Feather name="layers" size={20} color={colors.primary} />
            </View>
            <View className="flex-1 -my-2 -mr-3">
              <Picker
                selectedValue={workoutId}
                onValueChange={(val) => setWorkoutId(val)}
                dropdownIconColor={colors.placeholder}
                style={{ color: colors.text }}
                itemStyle={{ color: colors.text }}
              >
                <Picker.Item label="Select Workout Type" value="" />
                {defaultWorkouts.map((w) => (
                  <Picker.Item key={w.id} label={w.name} value={w.id} />
                ))}
              </Picker>
            </View>
          </View>
        </Section>

        <Section title="Date" error={errors.createdAt}>
          <Pressable onPress={() => setShowDate(!showDate)} className="flex-row items-center py-3 px-4">
            <View className="w-8 items-center justify-center mr-3">
              <Feather name="calendar" size={20} color={colors.placeholder} />
            </View>
            <View className="flex-1">
              <DateDisplay date={createdAt} />
            </View>
          </Pressable>
          {showDate && (
            <View className="mt-2 px-4 bg-card">
              <DatePicker
                date={createdAt}
                setDate={setCreatedAt}
                showDate={showDate}
                setShowDate={setShowDate}
              />
            </View>
          )}
        </Section>

        <Section title="Notes" error={errors.notes}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Details about your session..."
            multiline
            className="text-base text-text min-h-[100px] py-2 px-4"
            style={{ textAlignVertical: "top" }}
            placeholderTextColor="#9ca3af"
          />
        </Section>

        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          className={`mb-16 ${!isSubmitting ? "bg-primary" : ""}`}
        >
          {isEditing ? "Update Workout" : "Log Workout"}
        </Button>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

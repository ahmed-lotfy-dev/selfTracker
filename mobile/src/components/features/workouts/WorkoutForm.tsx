import React, { useState, useMemo, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
} from "react-native"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import DatePicker from "@/src/components/DatePicker"
import DateDisplay from "@/src/components/DateDisplay"
import { useRouter } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"
import { formatUTC } from "@/src/lib/utils/dateUtils"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"

import Button from "@/src/components/ui/Button"
import { PremiumCard } from "@/src/components/ui/PremiumCard"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useAlertStore } from "@/src/features/ui/useAlertStore"

export default function WorkoutForm({ isEditing, logId }: { isEditing?: boolean; logId?: string }) {
  const router = useRouter()
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()

  const workouts = useWorkoutsStore(s => s.workouts)
  const workoutLogs = useWorkoutsStore(s => s.workoutLogs)
  const addWorkoutLog = useWorkoutsStore(s => s.addWorkoutLog)
  const updateWorkoutLog = useWorkoutsStore(s => s.updateWorkoutLog)
  const addWorkout = useWorkoutsStore(s => s.addWorkout)
  const fetchWorkouts = useWorkoutsStore(s => s.fetchWorkouts)

  // Fetch workouts when component mounts or when workouts array is empty
  useEffect(() => {
    if (workouts.length === 0) {
      fetchWorkouts()
    }
  }, [workouts.length, fetchWorkouts])

  // Find existing log if editing
  const existingLog = useMemo(() => {
    if (logId) return workoutLogs.find(l => l.id === logId)
    return null
  }, [logId, workoutLogs])

  // State
  // Initialize from existing log if found
  const [workoutId, setWorkoutId] = useState<string>(existingLog?.workoutId || "")
  const [workoutName, setWorkoutName] = useState(existingLog?.workoutName || "")
  const [notes, setNotes] = useState(existingLog?.notes || "")
  const [createdAt, setCreatedAt] = useState(existingLog ? new Date(existingLog.createdAt) : new Date())
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Computed
  const isToday = useMemo(() => {
    const today = new Date()
    return createdAt.getDate() === today.getDate() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getFullYear() === today.getFullYear()
  }, [createdAt])

  // Memoized list for picker
  const pickerItems = useMemo(() => {
    return [
      { label: "Select a workout...", value: "" },
      ...workouts.map(w => ({ label: w.name, value: w.id })),
      { label: "Create New Workout", value: "new" }
    ]
  }, [workouts])

  const handleSubmit = async () => {
    // Validation
    if ((workoutId === "new" || !workoutId) && !workoutName.trim()) {
      showAlert("Error", "Please select a workout or enter a name", () => { }, undefined, "OK", undefined)
      return
    }

    setIsSubmitting(true)
    try {
      let finalWorkoutId = workoutId
      let finalWorkoutName = workoutName

      // If existing workout selected from picker
      if (workoutId && workoutId !== "new") {
        const w = workouts.find(w => w.id === workoutId)
        finalWorkoutName = w?.name || "Unknown Workout"
      }
      // If "new" selected or user typed custom name
      else if (workoutName.trim()) {
        // Create new template first
        const newTemplateId = crypto.randomUUID()
        finalWorkoutId = newTemplateId
        addWorkout({
          name: workoutName,
          userId: "user_local",
          isPublic: false,
        } as any)
      }

      if (isEditing && logId) {
        // UPDATE EXISTING LOG
        updateWorkoutLog(logId, {
          workoutId: finalWorkoutId,
          workoutName: finalWorkoutName,
          notes: notes || null,
          createdAt: formatUTC(createdAt)
        })
      } else {
        // CREATE NEW LOG
        addWorkoutLog({
          workoutId: finalWorkoutId,
          workoutName: finalWorkoutName,
          notes: notes || null,
          userId: "user_local",
          createdAt: formatUTC(createdAt) // Persist the selected date
        })
      }

      router.back()
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAwareScrollView
      bottomOffset={20}
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-5 pt-6 gap-6">

        {/* --- Activity Section --- */}
        <PremiumCard>
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialIcons name="fitness-center" size={18} color={colors.primary} />
            <Text className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Workout Details</Text>
          </View>

          <View>
            <View className={`rounded-xl ${Platform.OS === 'ios' ? 'bg-transparent' : 'border border-white/10 bg-white/5'}`}>
              <Picker
                selectedValue={workoutId}
                onValueChange={(itemValue) => setWorkoutId(itemValue)}
                style={{ color: colors.text }}
                dropdownIconColor={colors.text}
                itemStyle={{ color: colors.text, fontSize: 16 }}
              >
                {pickerItems.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>

            {(workoutId === "new" || !workoutId) && (
              <View className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 flex-row items-center gap-3">
                <Feather name="edit-2" size={18} color="rgba(255,255,255,0.4)" />
                <TextInput
                  className="flex-1 text-base font-medium"
                  style={{ color: colors.text }}
                  placeholder="Enter custom workout name"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  autoFocus={workoutId === "new"}
                />
              </View>
            )}
          </View>
        </PremiumCard>

        {/* --- Notes Section --- */}
        <PremiumCard>
          <View className="flex-row items-center gap-2 mb-3">
            <Feather name="align-left" size={16} color="rgba(255,255,255,0.4)" />
            <Text className="text-[10px] font-bold uppercase text-white/50 tracking-widest">Notes</Text>
          </View>
          <TextInput
            className="text-base leading-6"
            style={{ color: colors.text, minHeight: 80, textAlignVertical: 'top' }}
            placeholder="How did the workout feel?..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </PremiumCard>

        {/* --- Date Toggle --- */}
        <PremiumCard onPress={() => setIsDatePickerVisible(!isDatePickerVisible)}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10">
                <Feather name="calendar" size={18} color={isToday ? "rgba(255,255,255,0.4)" : colors.primary} />
              </View>
              <View>
                <Text className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-0.5">Date</Text>
                <Text className={`text-base font-black tracking-tight ${!isToday ? 'text-white' : 'text-white/60'}`}>
                  {!isToday ? <DateDisplay date={createdAt} /> : "Today"}
                </Text>
              </View>
            </View>
            <Feather name={isDatePickerVisible ? "chevron-up" : "chevron-down"} size={20} color={'rgba(255,255,255,0.2)'} />
          </View>
        </PremiumCard>

        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          className="mt-4 shadow-md bg-white text-black rounded-xl py-4"
          size="lg"
        >
          <Text className="text-black font-bold uppercase tracking-widest text-center w-full">{isEditing ? "Update Log" : "Log Workout"}</Text>
        </Button>

      </View>

      <DatePicker
        visible={isDatePickerVisible}
        date={createdAt}
        onClose={() => setIsDatePickerVisible(false)}
        onChange={setCreatedAt}
      />
    </KeyboardAwareScrollView>
  )
}

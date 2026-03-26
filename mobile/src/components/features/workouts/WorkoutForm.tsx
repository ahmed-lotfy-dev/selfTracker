import React, { useState, useMemo } from "react"
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
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <View className="bg-muted/30 px-4 py-3 border-b border-border flex-row items-center gap-2">
            <MaterialIcons name="fitness-center" size={18} color={colors.primary} />
            <Text className="text-sm font-bold uppercase text-placeholder tracking-wider">Workout Details</Text>
          </View>

          <View className="p-2">
            <View className={`rounded-xl ${Platform.OS === 'ios' ? 'bg-transparent' : 'border border-border bg-background'}`}>
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
              <View className="mt-2 mx-2 mb-2 p-3 bg-background rounded-xl border border-border flex-row items-center gap-3">
                <Feather name="edit-2" size={18} color={colors.placeholder} />
                <TextInput
                  className="flex-1 text-base font-medium"
                  style={{ color: colors.text }}
                  placeholder="Enter custom workout name"
                  placeholderTextColor={colors.placeholder}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  autoFocus={workoutId === "new"}
                />
              </View>
            )}
          </View>
        </View>

        {/* --- Notes Section --- */}
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden p-4">
          <TextInput
            className="text-base leading-6"
            style={{ color: colors.text, minHeight: 80, textAlignVertical: 'top' }}
            placeholder="Notes (optional)..."
            placeholderTextColor={colors.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* --- Date Toggle --- */}
        <Pressable
          onPress={() => setIsDatePickerVisible(!isDatePickerVisible)}
          className="bg-card rounded-2xl shadow-sm border border-white/5 overflow-hidden p-4 flex-row justify-between items-center"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/5">
              <Feather name="calendar" size={18} color={isToday ? colors.placeholder : colors.primary} />
            </View>
            <View>
              <Text className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-0.5">Date</Text>
              <Text className={`text-base font-black tracking-tight ${!isToday ? 'text-white' : 'text-white/60'}`}>
                {!isToday ? <DateDisplay date={createdAt} /> : "Today"}
              </Text>
            </View>
          </View>
          <Feather name={isDatePickerVisible ? "chevron-up" : "chevron-down"} size={20} color={'rgba(255,255,255,0.2)'} />
        </Pressable>

        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          className="mt-2 shadow-md"
          size="lg"
        >
          {isEditing ? "Update Log" : "Log Workout"}
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

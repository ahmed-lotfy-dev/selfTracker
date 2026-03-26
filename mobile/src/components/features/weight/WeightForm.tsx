import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
} from "react-native"
import { Feather, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import DatePicker from "@/src/components/DatePicker"
import DateDisplay from "@/src/components/DateDisplay"
import { useRouter } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"
import { formatUTC } from "@/src/lib/utils/dateUtils"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"

import Button from "@/src/components/ui/Button"
import { useWeightStore } from "@/src/stores/useWeightStore"

export default function WeightForm({ isEditing, logId }: { isEditing?: boolean; logId?: string }) {
  const router = useRouter()
  const colors = useThemeColors()

  const addWeightLog = useWeightStore(s => s.addWeightLog)
  const updateWeightLog = useWeightStore(s => s.updateWeightLog)
  const weightLogs = useWeightStore(s => s.weightLogs)

  // Find existing log if editing
  const existingLog = React.useMemo(() => {
    if (logId) return weightLogs.find(l => l.id === logId)
    return null
  }, [logId, weightLogs])

  const [weight, setWeight] = useState(existingLog?.weight || "")
  const [notes, setNotes] = useState(existingLog?.notes || "")
  const [createdAt, setCreatedAt] = useState(existingLog ? new Date(existingLog.createdAt) : new Date())
  const [showDate, setShowDate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!weight) return

    setIsSubmitting(true)
    try {
      if (isEditing && logId) {
        updateWeightLog(logId, {
          weight: String(weight),
          notes: notes || null,
          createdAt: formatUTC(createdAt)
        })
      } else {
        addWeightLog({
          userId: "user_local",
          weight: String(weight),
          notes: notes || null,
          createdAt: formatUTC(createdAt) // Persist date
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

        {/* --- Main Measurement --- */}
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <View className="bg-muted/30 px-4 py-3 border-b border-border flex-row items-center gap-2">
            <FontAwesome5 name="weight" size={16} color={colors.primary} />
            <Text className="text-sm font-bold uppercase text-placeholder tracking-wider">Measurement</Text>
          </View>

          <View className="p-6 items-center justify-center">
            <View className="flex-row items-end gap-2">
              <TextInput
                className="text-5xl font-bold p-0"
                style={{ color: colors.text, includeFontPadding: false }}
                placeholder="00.0"
                placeholderTextColor={colors.placeholder + '40'}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
                maxLength={5}
                textAlign="center"
                autoFocus
              />
              <Text className="text-xl font-medium text-placeholder mb-2">kg</Text>
            </View>
            <Text className="text-xs text-placeholder mt-2">Enter your current weight</Text>
          </View>
        </View>

        {/* --- Notes --- */}
        <View className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden p-4">
          <TextInput
            className="text-base leading-6"
            style={{ color: colors.text, minHeight: 80, textAlignVertical: 'top' }}
            placeholder="How are you feeling? Track mood, energy, or diet..."
            placeholderTextColor={colors.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* --- Date Toggle --- */}
        <Pressable
          onPress={() => setShowDate(!showDate)}
          className="bg-card rounded-2xl shadow-sm border border-white/5 overflow-hidden p-4 flex-row justify-between items-center"
        >
          {(() => {
            const isToday = createdAt.getDate() === new Date().getDate() &&
              createdAt.getMonth() === new Date().getMonth() &&
              createdAt.getFullYear() === new Date().getFullYear();
            return (
              <>
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
                <Feather name={showDate ? "chevron-up" : "chevron-down"} size={20} color={'rgba(255,255,255,0.2)'} />
              </>
            );
          })()}
        </Pressable>

        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          className="mt-2 shadow-md"
          size="lg"
        >
          {isEditing ? "Update Entry" : "Save Entry"}
        </Button>

      </View>

      <DatePicker
        visible={showDate}
        date={createdAt}
        onClose={() => setShowDate(false)}
        onChange={setCreatedAt}
      />
    </KeyboardAwareScrollView>
  )
}

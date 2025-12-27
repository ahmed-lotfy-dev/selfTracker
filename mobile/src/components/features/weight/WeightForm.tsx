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
        <View className="flex-row items-center justify-between px-2">
          <Pressable
            onPress={() => setShowDate(!showDate)}
            className="flex-row items-center gap-2 py-2 px-3 rounded-full bg-muted/30"
          >
            <Feather name="calendar" size={14} color={showDate ? colors.primary : colors.placeholder} />
            <Text className={`text-xs font-medium ${showDate ? 'text-primary' : 'text-placeholder'}`}>
              {showDate ? <DateDisplay date={createdAt} /> : "Today"}
            </Text>
            {!showDate && <Feather name="chevron-down" size={12} color={colors.placeholder} />}
          </Pressable>
        </View>

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

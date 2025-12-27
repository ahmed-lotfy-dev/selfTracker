import React, { useState } from "react"
import { TextInput, View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { useThemeColors } from "@/src/constants/Colors"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"

import Button from "@/src/components/ui/Button"
import Feather from "@expo/vector-icons/build/Feather"

const HABIT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#64748b',
]

export default function HabitForm() {
  const router = useRouter()
  const { user } = useAuth()
  const colors = useThemeColors()
  const addHabit = useHabitsStore((s) => s.addHabit)

  const [name, setName] = useState("")
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrors({ name: "Habit name is required" })
      return
    }

    setIsSubmitting(true)

    addHabit({
      userId: user?.id || 'local',
      name: name.trim(),
      description: null,
      color: color,
    })

    router.back()
  }

  return (
    <KeyboardAwareScrollView
      bottomOffset={62}
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-4 pt-4">
        <View className="p-4 bg-card rounded-3xl border border-border">
          <View className="mb-4">
            <Text className="text-sm font-medium ml-1 mb-2" style={{ color: colors.text }}>Habit Name</Text>
            <TextInput
              className="w-full px-4 py-4 rounded-2xl bg-muted/50 border border-border text-base"
              style={{ color: colors.text }}
              placeholder="e.g. Read 10 pages"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              autoFocus
            />
          </View>

          <View>
            <Text className="text-sm font-medium ml-1 mb-3" style={{ color: colors.text }}>Check Color</Text>
            <View className="flex-row flex-wrap gap-3">
              {HABIT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  className="w-10 h-10 rounded-full items-center justify-center transition-all shadow-sm"
                  style={{
                    backgroundColor: c,
                    borderWidth: color === c ? 3 : 0,
                    borderColor: colors.card,
                    shadowColor: c,
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    transform: [{ scale: color === c ? 1.1 : 1 }]
                  }}
                >
                  {color === c && <Feather name="check" size={20} color="white" strokeWidth={3} />}
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          className={`mb-16 mt-4 ${!isSubmitting ? "bg-primary" : ""}`}
        >
          Create Habit
        </Button>
      </View>
    </KeyboardAwareScrollView>
  )
}

import React, { useState } from "react"
import { TextInput, View, Text, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { useThemeColors } from "@/src/constants/Colors"
import { useHabitsStore } from "@/src/stores/useHabitsStore"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"
import { PremiumCard } from "@/src/components/ui/PremiumCard"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Button from "@/src/components/ui/Button"

const HABIT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
]

export default function HabitForm() {
  const router = useRouter()
  const { user } = useAuth()
  const colors = useThemeColors()
  const addHabit = useHabitsStore((s) => s.addHabit)

  const [name, setName] = useState("")
  const [color, setColor] = useState(HABIT_COLORS[4]) // Default to indigo
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

    setTimeout(() => {
      router.back()
    }, 100)
  }

  return (
    <KeyboardAwareScrollView
      bottomOffset={62}
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-4 pt-4">
        <PremiumCard
          gradientColors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          containerStyle="mb-6"
        >
          <View className="mb-6">
            <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
              Habit Identity
            </Text>
            <View className="relative">
              <TextInput
                className="w-full px-5 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg font-semibold"
                placeholder="e.g. Morning Meditation"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={name}
                onChangeText={(text) => {
                  setName(text)
                  if (errors.name) setErrors({ ...errors, name: "" })
                }}
                autoFocus
                selectionColor={colors.primary}
              />
              {errors.name && (
                <Text className="text-red-400 text-[10px] mt-1 ml-2 font-bold uppercase">{errors.name}</Text>
              )}
            </View>
          </View>

          <View>
            <View className="flex-row items-center justify-between mb-3 ml-1">
              <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                Visual Signature
              </Text>
              <View
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: color, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 5 }}
              />
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-4">
              {HABIT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  className="w-[22%] aspect-square rounded-2xl items-center justify-center border-2"
                  style={{
                    backgroundColor: color === c ? `${c}20` : 'rgba(255,255,255,0.03)',
                    borderColor: color === c ? c : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View
                    className="w-6 h-6 rounded-full"
                    style={{
                      backgroundColor: c,
                      shadowColor: c,
                      shadowOpacity: color === c ? 0.6 : 0,
                      shadowRadius: 10,
                      elevation: color === c ? 10 : 0
                    }}
                  />
                  {color === c && (
                    <View className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <Feather name="check" size={10} color={c} strokeWidth={4} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </PremiumCard>

        <View className="px-2">
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            className={`h-16 rounded-3xl text-lg font-bold tracking-tight ${!isSubmitting ? "bg-primary shadow-lg shadow-primary/30" : ""}`}
          >
            Deploy Habit
          </Button>

          <Text className="text-white/20 text-center text-[10px] mt-4 uppercase tracking-tighter">
            System sync will occur immediately after deployment
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

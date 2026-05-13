import React from "react"
import { View, Text, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Section } from "@/src/components/ui/Section"
import Button from "@/src/components/ui/Button"
import Input from "@/src/components/ui/Input"
import { useThemeColors } from "@/src/constants/Colors"

interface GoalsSectionProps {
  goals: any[]
  isLoading: boolean
  showAddGoal: boolean
  setShowAddGoal: (show: boolean) => void
  newGoalType: string
  setNewGoalType: (type: any) => void
  newGoalTarget: string
  setNewGoalTarget: (target: string) => void
  onAddGoal: () => void
  onDeleteGoal: (goal: any) => void
}

export default function GoalsSection({
  goals,
  isLoading,
  showAddGoal,
  setShowAddGoal,
  newGoalType,
  setNewGoalType,
  newGoalTarget,
  setNewGoalTarget,
  onAddGoal,
  onDeleteGoal
}: GoalsSectionProps) {
  const colors = useThemeColors()

  return (
    <Section title="My Goals">
      {isLoading ? (
        <View className="p-4 items-center">
          <Text className="text-placeholder">Loading goals...</Text>
        </View>
      ) : (
        <View className="p-4">
          {goals?.length === 0 ? (
            <Text className="text-placeholder text-sm text-center italic py-2">No goals set yet.</Text>
          ) : (
            goals?.map((goal) => (
              <View key={goal.id} className="flex-row items-center justify-between py-2 border-b border-border last:border-0">
                <View>
                  <Text className="font-medium text-text capitalize">
                    {goal.goalType.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text className="text-xs text-placeholder">Target: {goal.targetValue}</Text>
                </View>
                <Pressable onPress={() => onDeleteGoal(goal)} className="p-2">
                  <Feather name="trash-2" size={16} color={colors.error} />
                </Pressable>
              </View>
            ))
          )}

          <Button
            variant="ghost"
            onPress={() => setShowAddGoal(!showAddGoal)}
            className="mt-2 text-secondary"
          >
            <Feather name={showAddGoal ? "minus" : "plus"} size={16} color={colors.secondary} />
            <Text className="ml-2 text-secondary">{showAddGoal ? "Cancel" : "Add Goal"}</Text>
          </Button>

          {showAddGoal && (
            <View className="mt-4 bg-background p-3 rounded-xl border border-border">
              <Text className="text-xs font-bold text-placeholder mb-2 uppercase">Goal Type</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {["loseWeight", "gainWeight", "bodyFat", "muscleMass"].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setNewGoalType(t as any)}
                    className={`px-3 py-1.5 rounded-full border ${newGoalType === t ? 'bg-secondary/10 border-secondary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-xs ${newGoalType === t ? 'text-secondary font-bold' : 'text-text-secondary'}`}>
                      {t.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Input
                label="Target Value"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
                keyboardType="numeric"
                placeholder="e.g. 75"
              />

              <Button
                onPress={onAddGoal}
                variant="secondary"
                size="sm"
              >
                Save Goal
              </Button>
            </View>
          )}
        </View>
      )}
    </Section>
  )
}

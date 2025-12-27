import React from 'react';
import { View, Text, ScrollView } from 'react-native';

import { useHabitsStore, useActiveHabits, Habit } from '@/src/stores/useHabitsStore';
import { FontAwesome5 } from '@expo/vector-icons';
import { useThemeColors } from '@/src/constants/Colors';
import Header from "@/src/components/Header";
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton";
import AddButton from "@/src/components/Buttons/AddButton";
import HabitCard from "@/src/components/features/habits/HabitCard";
import { useAlertStore } from '@/src/features/ui/useAlertStore';

export default function HabitsScreen() {
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()

  const habits = useActiveHabits()
  const toggleComplete = useHabitsStore((s) => s.toggleComplete)
  const deleteHabit = useHabitsStore((s) => s.deleteHabit)

  const handleDelete = (habit: Habit) => {
    showAlert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.name}"? This cannot be undone.`,
      () => deleteHabit(habit.id),
      undefined,
      "Delete",
      "Cancel",
      'error'
    )
  }

  const completionRate = habits.length > 0
    ? Math.round((habits.filter((h) => h.completedToday).length / habits.length) * 100)
    : 0

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">
        <Header
        className='px-2'
          title="Habits"
          rightAction={<DrawerToggleButton/>}
        />

        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View
            className="p-5 rounded-2xl border mb-6 shadow-sm overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.border}80`
            }}
          >
            <View className="absolute right-0 top-0 w-32 h-32 rounded-full -mr-10 -mt-10 opacity-5" style={{ backgroundColor: colors.primary }} />

            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60" style={{ color: colors.text }}>Daily Progress</Text>
                <View className="flex-row items-baseline gap-2">
                  <FontAwesome5 name="trophy" size={16} color="#EAB308" />
                  <Text className="text-4xl font-extrabold" style={{ color: colors.text }}>{completionRate}%</Text>
                </View>
              </View>
              <View className="items-end">
                <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                  <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                    {habits.filter((h) => h.completedToday).length} / {habits.length} Done
                  </Text>
                </View>
              </View>
            </View>

            <View className="h-2 rounded-full w-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${completionRate}%`,
                  backgroundColor: colors.primary
                }}
              />
            </View>
          </View>

          <Text className="text-lg font-bold mb-4 ml-1" style={{ color: colors.text }}>Your Habits</Text>

          {habits.length === 0 ? (
            <View className="items-center justify-center py-16 border-2 border-dashed rounded-3xl opacity-50 mb-8" style={{ borderColor: colors.border }}>
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-black/5 dark:bg-white/5">
                <FontAwesome5 name="trophy" size={24} color={colors.text} style={{ opacity: 0.5 }} />
              </View>
              <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>No habits yet</Text>
              <Text className="text-sm text-center px-8 opacity-60" style={{ color: colors.text }}>
                Start small. Create your first habit to begin your journey towards consistency.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={() => toggleComplete(habit.id)}
                  onDelete={() => handleDelete(habit)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View className="absolute bottom-4 -right-2">
          <AddButton path="/habits" />
        </View>
      </View>
    </View>
  )
}

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useHabitsStore, useActiveHabits } from '@/src/stores/useHabitsStore';
import { Habit } from '@/src/types/habitType';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/constants/Colors';
import Header from "@/src/components/Header";
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton";
import AddButton from "@/src/components/Buttons/AddButton";
import HabitCard from "@/src/components/features/habits/HabitCard";
import { useAlertStore } from '@/src/features/ui/useAlertStore';
import { LinearGradient } from 'expo-linear-gradient';
import { PremiumCard } from '@/src/components/ui/PremiumCard';

const { width } = Dimensions.get('window');

import DailyMasteryCard from "@/src/components/features/habits/DailyMasteryCard"
import EmptyHabitsState from "@/src/components/features/habits/EmptyHabitsState"

export default function HabitsScreen() {
  const colors = useThemeColors();
  const { showAlert } = useAlertStore();

  const habits = useActiveHabits();
  const toggleComplete = useHabitsStore((s) => s.toggleComplete);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);

  const handleDelete = (habit: Habit) => {
    showAlert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.name}"? This cannot be undone.`,
      () => deleteHabit(habit.id),
      undefined,
      "Delete",
      "Cancel",
      'error'
    );
  };

  const today = new Date().toISOString().split('T')[0]
  const completedCount = habits.filter((h) => h.completionDates?.includes(today)).length;
  const completionRate = habits.length > 0
    ? Math.round((completedCount / habits.length) * 100)
    : 0;

  return (
    <View className="flex-1 bg-background px-4">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      
      <View className="flex-1">
        <Header
          title="Habits"
          rightAction={<DrawerToggleButton />}
        />

        <ScrollView
          className="flex-1 pt-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <DailyMasteryCard 
            completedCount={completedCount}
            totalCount={habits.length}
            completionRate={completionRate}
          />

          <View className="flex-row items-center justify-between mb-4 px-1">
             <Text className="text-white/70 text-sm font-bold uppercase tracking-tighter">
                ACTIVE REPUTATION
             </Text>
             <View className="flex-row gap-4">
                <Ionicons name="filter" size={16} color="rgba(255,255,255,0.3)" />
                <Ionicons name="search" size={16} color="rgba(255,255,255,0.3)" />
             </View>
          </View>

          {habits.length === 0 ? (
            <EmptyHabitsState />
          ) : (
            <View className="mb-8">
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

        <AddButton path="/home/habits_stack" />
      </View>
    </View>
  );
}


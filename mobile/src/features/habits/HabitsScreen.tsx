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

  const completedCount = habits.filter((h) => h.completedToday).length;
  const completionRate = habits.length > 0
    ? Math.round((completedCount / habits.length) * 100)
    : 0;

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      
      <View className="flex-1">
        <Header
          className='px-2'
          title="Consistency"
          rightAction={<DrawerToggleButton />}
        />

        <ScrollView
          className="flex-1 px-4 pt-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          {/* Hero Statistics Section */}
          <View className="mb-6">
            <PremiumCard 
              gradientColors={['rgba(99, 102, 241, 0.15)', 'rgba(79, 70, 229, 0.05)']}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Daily Mastery
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-4xl font-extrabold text-white">{completionRate}%</Text>
                    {completionRate === 100 && habits.length > 0 && (
                      <View className="bg-yellow-500/20 px-2 py-0.5 rounded-md">
                        <Text className="text-yellow-500 text-[10px] font-black">FLAWLESS</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View className="items-center justify-center bg-white/5 w-16 h-16 rounded-3xl border border-white/10">
                   <MaterialCommunityIcons 
                    name={completionRate >= 50 ? "trophy-variant" : "timer-sand"} 
                    size={32} 
                    color={completionRate >= 50 ? "#fbbf24" : "rgba(255,255,255,0.4)"} 
                   />
                </View>
              </View>

              <View className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                <LinearGradient
                   colors={['#6366f1', '#a855f7']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 0 }}
                   style={{ width: `${completionRate}%`, height: '100%' }}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-white/30 text-xs font-medium">
                  {completedCount} of {habits.length} habits locked in
                </Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="stats-chart" size={10} color="rgba(255,255,255,0.2)" />
                  <Text className="text-white/20 text-[10px] uppercase font-bold">Live Pulse</Text>
                </View>
              </View>
            </PremiumCard>
          </View>

          {/* Habits Header */}
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
            <View className="items-center justify-center py-20 px-10">
              <View className="w-20 h-20 rounded-[30px] bg-white/5 items-center justify-center border border-white/10 mb-6">
                <MaterialCommunityIcons name="lightning-bolt-outline" size={40} color="rgba(255,255,255,0.1)" />
              </View>
              <Text className="text-xl font-bold text-white text-center mb-2">Zero Friction Environment</Text>
              <Text className="text-white/30 text-center text-sm leading-relaxed">
                You haven't defined any habits yet. Start with something so small it's impossible to fail.
              </Text>
            </View>
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

        {/* Global Action */}
        <View className="absolute bottom-10 right-6">
           <AddButton path="/home/habits/add" />
        </View>
      </View>
    </View>
  );
}

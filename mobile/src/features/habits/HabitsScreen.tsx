import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { useCollections } from '@/src/components/Provider/CollectionsProvider';
import { useLiveQuery } from '@tanstack/react-db';
import { useAuth } from '@/src/features/auth/useAuthStore';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/constants/Colors';
import Header from "@/src/components/Header";
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton";

export default function HabitsScreen() {
  const collections = useCollections();
  const { user } = useAuth();
  const colors = useThemeColors();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const { data: habits = [] } = useLiveQuery((q: any) => {
    if (!collections?.habits) return null;
    return q.from({ habits: collections.habits })
      .orderBy(({ habits }: any) => habits.created_at, 'desc')
      .select(({ habits }: any) => ({
        id: habits.id,
        userId: habits.user_id,
        name: habits.name,
        description: habits.description,
        streak: habits.streak,
        color: habits.color,
        completedToday: habits.completed_today,
        lastCompletedAt: habits.last_completed_at,
        createdAt: habits.created_at,
        updatedAt: habits.updated_at,
        deletedAt: habits.deleted_at,
      }))
  }, [collections?.habits]) ?? { data: [] };

  const handleCreate = async () => {
    if (!newHabitName.trim() || !collections?.habits) return;

    await collections.habits.insert({
      id: crypto.randomUUID(),
      user_id: user?.id || 'local',
      name: newHabitName,
      color: "#10b981", // Default green
      streak: 0,
      completed_today: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setNewHabitName("");
    setModalVisible(false);
  };

  const toggleHabit = async (habit: any) => {
    if (!collections?.habits) return;

    const isCompleting = !habit.completedToday;
    const newStreak = isCompleting
      ? (habit.streak || 0) + 1
      : Math.max(0, (habit.streak || 0) - 1);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    await collections.habits.update(habit.id, (draft: any) => {
      draft.completed_today = isCompleting ? 1 : 0;
      draft.streak = newStreak;
      draft.last_completed_at = isCompleting ? new Date().toISOString() : habit.lastCompletedAt;
      draft.updated_at = new Date().toISOString();
    });
  };

  const completionRate = habits.length > 0
    ? Math.round((habits.filter((h: any) => h.completedToday).length / habits.length) * 100)
    : 0;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">
        {/* Header - No Back Button, showing Drawer Toggle */}
        <Header
          title="Habits"
        />

        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          {/* Progress Section - Matching Desktop "Daily Progress" */}
          <View
            className="p-5 rounded-2xl border mb-6 shadow-sm overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.border}80` // slightly transparent border
            }}
          >
            {/* Background decoration */}
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
                    {habits.filter((h: any) => h.completedToday).length} / {habits.length} Done
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
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

          {/* Habits Grid */}
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
              {habits.map((habit: any) => {
                const isCompleted = habit.completedToday;
                return (
                  <Pressable
                    key={habit.id}
                    onPress={() => toggleHabit(habit)}
                    className="group relative overflow-hidden rounded-2xl border p-5 transition-all active:scale-[0.99]"
                    style={{
                      backgroundColor: colors.card,
                      borderColor: isCompleted ? '#22c55e80' : colors.border, // Green border if completed
                      opacity: 1
                    }}
                  >
                    {/* Glow effect for completed state */}
                    {isCompleted && (
                      <View
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundColor: '#22c55e' }}
                      />
                    )}

                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-4">
                        <Text
                          className="text-lg font-bold mb-1 leading-tight"
                          style={{
                            color: isCompleted ? '#16a34a' : colors.text, // Green text if completed
                            textDecorationLine: 'none' // Removed strikethrough to match desktop
                          }}
                        >
                          {habit.name}
                        </Text>
                        <Text className="text-xs opacity-50" style={{ color: colors.text }}>
                          {isCompleted ? "Completed for today" : "Tap to mark done"}
                        </Text>
                      </View>

                      {/* Checkbox / Circle */}
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center border-2 transition-all shadow-sm"
                        style={{
                          borderColor: isCompleted ? '#22c55e' : `${colors.text}30`,
                          backgroundColor: isCompleted ? '#22c55e' : 'transparent',
                          transform: [{ scale: isCompleted ? 1.1 : 1 }]
                        }}
                      >
                        {isCompleted && <Feather name="check" size={20} color="#FFF" strokeWidth={3} />}
                      </View>
                    </View>

                    {/* Streak Badge */}
                    <View className="flex-row items-center mt-4">
                      <View
                        className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: isCompleted
                            ? (habit.streak > 0 ? '#ffedd5' : `${colors.text}10`)
                            : '#eff6ff', // Blue-50 for potential
                        }}
                      >
                        <FontAwesome5
                          name="fire"
                          size={12}
                          color={isCompleted
                            ? (habit.streak > 0 ? "#ea580c" : colors.placeholder)
                            : "#3b82f6" // Blue-500 for potential
                          }
                        />
                        <Text
                          className="text-xs font-bold"
                          style={{
                            color: isCompleted
                              ? (habit.streak > 0 ? '#ea580c' : colors.placeholder)
                              : "#3b82f6" // Blue-500
                          }}
                        >
                          {isCompleted
                            ? `${habit.streak} Day Streak`
                            : `Reach ${habit.streak + 1} Day Streak!`
                          }
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* FAB */}
        <Pressable
          onPress={() => setModalVisible(true)}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
        >
          <Feather name="plus" size={28} color="#FFF" />
        </Pressable>

        {/* Create Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable onPress={() => setModalVisible(false)} className="flex-1 bg-black/60 justify-center px-4">
            <Pressable onPress={(e) => e.stopPropagation()} className="bg-card rounded-3xl p-6 shadow-xl" style={{ backgroundColor: colors.card }}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold font-orbitron" style={{ color: colors.text }}>New Habit</Text>
                <Pressable onPress={() => setModalVisible(false)} className="p-2 -mr-2">
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-bold mb-2 ml-1 opacity-70" style={{ color: colors.text }}>NAME</Text>
                <TextInput
                  value={newHabitName}
                  onChangeText={setNewHabitName}
                  placeholder="e.g. Read 30 mins"
                  placeholderTextColor={colors.placeholder}
                  className="p-4 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }}
                  autoFocus
                />
              </View>

              <Pressable
                onPress={handleCreate}
                disabled={!newHabitName.trim()}
                className="w-full py-4 rounded-xl items-center shadow-sm active:scale-[0.99]"
                style={{ backgroundColor: !newHabitName.trim() ? colors.border : colors.primary }}
              >
                <Text className="font-bold text-base" style={{ color: !newHabitName.trim() ? colors.placeholder : '#FFF' }}>
                  Create Habit
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

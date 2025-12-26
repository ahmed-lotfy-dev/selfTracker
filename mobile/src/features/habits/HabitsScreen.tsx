import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useCollections } from '@/src/components/Provider/CollectionsProvider'; // Correct import for mobile
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

  // Explicit field selection to match mobile pattern
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

    await collections.habits.update({
      id: habit.id,
      completed_today: isCompleting ? 1 : 0,
      streak: newStreak,
      last_completed_at: isCompleting ? new Date().toISOString() : habit.lastCompletedAt,
      updated_at: new Date().toISOString(),
    });
  };

  const completionRate = habits.length > 0
    ? Math.round((habits.filter((h: any) => h.completedToday).length / habits.length) * 100)
    : 0;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">
        {/* Header */}
        <Header
          title="Habits"
          leftAction={<DrawerToggleButton />}
        />

        {/* Status Cards */}
        <View className="px-4 mt-4">
          <View
            className="flex-row items-center justify-between p-4 rounded-2xl border mb-4 shadow-sm"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <View>
              <Text className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70" style={{ color: colors.text }}>Daily Goals</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-3xl font-extrabold" style={{ color: colors.primary }}>{completionRate}%</Text>
                <Text className="text-xs font-medium opacity-50" style={{ color: colors.text }}>completed</Text>
              </View>
            </View>

            <View className="items-end">
              <View className="flex-row items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                <Feather name="check-circle" size={12} color={colors.primary} />
                <Text className="text-xs font-bold" style={{ color: colors.primary }}>{habits.filter((h: any) => h.completedToday).length}/{habits.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Habits Grid */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {habits.length === 0 ? (
            <View className="items-center justify-center py-16 border-2 border-dashed rounded-2xl opacity-50" style={{ borderColor: colors.border }}>
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${colors.primary}10` }}>
                <Ionicons name="sparkles" size={32} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>No habits yet</Text>
              <Text className="text-sm text-center px-8 opacity-60" style={{ color: colors.text }}>Start building your streak today!</Text>
            </View>
          ) : (
            <View className="gap-3">
              {habits.map((habit: any) => (
                <Pressable
                  key={habit.id}
                  onPress={() => toggleHabit(habit)}
                  className="rounded-2xl border p-4 flex-row items-center justify-between"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: habit.completedToday ? colors.primary : colors.border,
                    opacity: habit.completedToday ? 0.9 : 1
                  }}
                >
                  <View className="flex-1 mr-4">
                    <View className="flex-row items-baseline justify-between mb-2">
                      <Text className="text-base font-bold" style={{ color: colors.text, textDecorationLine: habit.completedToday ? 'line-through' : 'none', opacity: habit.completedToday ? 0.5 : 1 }}>
                        {habit.name}
                      </Text>

                      {/* Streak Badge */}
                      <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md" style={{ backgroundColor: habit.streak > 0 ? '#ffedd5' : colors.border }}>
                        <FontAwesome5 name="fire" size={10} color={habit.streak > 0 ? "#F97316" : colors.placeholder} />
                        <Text className="text-[10px] font-bold" style={{ color: habit.streak > 0 ? '#F97316' : colors.placeholder }}>
                          {habit.streak}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-xs opacity-50 line-clamp-1" style={{ color: colors.text }}>
                      {habit.completedToday ? 'Completed today!' : 'Tap to complete'}
                    </Text>
                  </View>

                  {/* Checkbox */}
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center border-2"
                    style={{
                      borderColor: habit.completedToday ? colors.primary : colors.border,
                      backgroundColor: habit.completedToday ? colors.primary : 'transparent'
                    }}
                  >
                    {habit.completedToday && <Feather name="check" size={16} color="#FFF" strokeWidth={4} />}
                  </View>
                </Pressable>
              ))}
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

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
    <View className="flex-1 bg-background px-2" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">
        {/* Header */}
        <Header
          title="Habits"
          rightAction={
            <Pressable
              onPress={() => setModalVisible(true)}
              className="w-10 h-10 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Feather name="plus" size={24} color="#FFF" />
            </Pressable>
          }
          leftAction={<DrawerToggleButton />}
        />

        {/* Progress Card */}
        <View
          className="bg-card border border-border p-5 rounded-2xl mb-6 shadow-sm mt-4"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xs font-bold text-placeholder uppercase tracking-widest mb-1" style={{ color: colors.placeholder }}>Daily Progress</Text>
              <View className="flex-row items-center">
                <Ionicons name="trophy" size={20} color="#EAB308" style={{ marginRight: 8 }} />
                <Text className="text-3xl font-extrabold text-primary" style={{ color: colors.primary }}>{completionRate}%</Text>
              </View>
            </View>
            <View className="bg-primary/10 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${colors.primary}1A` }}>
              <Text className="text-primary font-bold text-xs" style={{ color: colors.primary }}>
                {habits.filter((h: any) => h.completedToday).length} / {habits.length} Done
              </Text>
            </View>
          </View>
          {/* Custom Progress Bar */}
          <View className="h-2 bg-muted rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${completionRate}%`, backgroundColor: colors.primary }}
            />
          </View>
        </View>

        {/* Habits List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {habits.length === 0 ? (
            <View className="items-center justify-center py-10 border-2 border-dashed border-border rounded-2xl bg-card/50" style={{ borderColor: colors.border, backgroundColor: `${colors.card}80` }}>
              <View className="bg-muted p-4 rounded-full mb-4" style={{ backgroundColor: colors.border }}>
                <Ionicons name="trophy-outline" size={32} color={colors.placeholder} />
              </View>
              <Text className="text-lg font-semibold text-text mb-1" style={{ color: colors.text }}>No habits yet</Text>
              <Text className="text-placeholder text-center px-8" style={{ color: colors.placeholder }}>Create your first habit to start tracking.</Text>
            </View>
          ) : (
            <View className="gap-4">
              {habits.map((habit: any) => (
                <Pressable
                  key={habit.id}
                  onPress={() => toggleHabit(habit)}
                  className={`bg-card border p-4 rounded-xl flex-row items-center justify-between active:opacity-90 ${habit.completedToday ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
                  style={{
                    backgroundColor: habit.completedToday ? `${colors.primary}0D` : colors.card,
                    borderColor: habit.completedToday ? `${colors.primary}80` : colors.border
                  }}
                >
                  <View className="flex-1 mr-4">
                    <Text className={`text-lg font-bold mb-1 ${habit.completedToday ? 'text-primary' : 'text-text'}`} style={{ color: habit.completedToday ? colors.primary : colors.text }}>
                      {habit.name}
                    </Text>
                    <View className="flex-row items-center">
                      <View
                        className={`flex-row items-center px-2 py-0.5 rounded-full mr-2 ${habit.streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-muted'}`}
                        style={{ backgroundColor: habit.streak > 0 ? '#ffedd5' : colors.border }}
                      >
                        <FontAwesome5 name="fire" size={10} color={habit.streak > 0 ? "#F97316" : colors.placeholder} style={{ marginRight: 4 }} />
                        <Text className={`text-xs font-bold ${habit.streak > 0 ? 'text-orange-500' : 'text-placeholder'}`} style={{ color: habit.streak > 0 ? '#F97316' : colors.placeholder }}>
                          {habit.streak} Day Streak
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    className={`h-8 w-8 rounded-full items-center justify-center border-2 ${habit.completedToday ? 'bg-primary border-primary' : 'border-placeholder bg-transparent'}`}
                    style={{
                      backgroundColor: habit.completedToday ? colors.primary : 'transparent',
                      borderColor: habit.completedToday ? colors.primary : colors.placeholder
                    }}
                  >
                    {habit.completedToday && <Feather name="check" size={18} color="#FFF" strokeWidth={3} />}
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Create Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-card rounded-t-3xl p-6 h-[40%]" style={{ backgroundColor: colors.card }}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-text font-orbitron" style={{ color: colors.text }}>Create New Habit</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <Text className="text-text font-medium mb-2" style={{ color: colors.text }}>Name</Text>
              <TextInput
                value={newHabitName}
                onChangeText={setNewHabitName}
                placeholder="e.g. Read 10 pages"
                placeholderTextColor={colors.placeholder}
                className="bg-muted p-4 rounded-xl text-text font-medium border border-border focus:border-primary mb-6"
                style={{
                  backgroundColor: colors.border, // Muted fallback
                  color: colors.text,
                  borderColor: colors.border
                }}
                autoFocus
              />

              <Pressable
                onPress={handleCreate}
                disabled={!newHabitName.trim()}
                className={`w-full py-4 rounded-xl items-center ${!newHabitName.trim() ? 'bg-muted' : 'bg-primary'}`}
                style={{ backgroundColor: !newHabitName.trim() ? colors.border : colors.primary }}
              >
                <Text className={`font-bold text-lg ${!newHabitName.trim() ? 'text-placeholder' : 'text-white'}`} style={{ color: !newHabitName.trim() ? colors.placeholder : '#FFF' }}>
                  Create Habit
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

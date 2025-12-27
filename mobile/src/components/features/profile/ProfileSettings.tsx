import React, { useState, useMemo } from "react"
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Image,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { useAuthStore } from "@/src/features/auth/useAuthStore"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import { useUpdate } from "@/src/hooks/useUpdate"
import { User } from "@/src/types/userType"
import LogoutButton from "@/src/components/features/auth/LogoutButton"
import { updateUser } from "@/src/lib/api/userApi"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useThemeColors } from "@/src/constants/Colors"
import { useProfileImage } from "@/src/hooks/useProfileImage"

import Button from "@/src/components/ui/Button"
import { Section } from "@/src/components/ui/Section"
import Row from "@/src/components/ui/Row"
import Input from "@/src/components/ui/Input"
import SyncSection from "./SyncSection"

type UserGoal = {
  id: string;
  userId: string;
  goalType: string;
  targetValue: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export default function ProfileSettings() {
  const { user } = useAuth()
  const { updateMutation } = useUpdate({ mutationFn: updateUser })
  const { mutate: updateUserMutation, isPending } = updateMutation
  const { showAlert } = useAlertStore()
  const colors = useThemeColors()

  const [name, setName] = useState(user?.name || "")
  const [weight, setWeight] = useState(user?.weight?.toString() || "")
  const [height, setHeight] = useState(user?.height?.toString() || "")
  const [unitSystem, setUnitSystem] = useState(user?.unitSystem || "metric")
  const [theme, setTheme] = useState(user?.theme || "system")
  const [currency, setCurrency] = useState(user?.currency || "EGP")
  const { pickAndUploadImage, isUploading: isImageUploading } = useProfileImage()

  const [gender, setGender] = useState(user?.gender || "male")
  const [income, setIncome] = useState(user?.income?.toString() || "")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
  )
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalType, setNewGoalType] = useState<"loseWeight" | "gainWeight" | "bodyFat" | "muscleMass">("loseWeight")
  const [newGoalTarget, setNewGoalTarget] = useState("")

  const goals: any[] = []
  const isLoadingGoals = false

  const handleSave = () => {
    if (!user?.id) return

    const updatedFields: Partial<User> = {
      name,
      // image is handled separately by useProfileImage hook
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      unitSystem,
      currency,
      theme,
      gender,
      income: income ? parseFloat(income) : null,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split("T")[0] : null,
    }

    updateUserMutation(
      { id: user.id, ...updatedFields },
      {
        onSuccess: () => {
          showAlert("Saved", "Profile updated successfully!", () => { }, undefined, "Got it", undefined)
        },
        onError: (e) => showAlert("Error", e.message, () => { }, undefined, "OK", undefined),
      }
    )
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth
    setShowDatePicker(Platform.OS === "ios")
    setDateOfBirth(currentDate)
  }

  const handleAddGoal = async () => {
    showAlert("Coming Soon", "Goal tracking will be available once sync is enabled.", () => { }, undefined, "OK", undefined)
  }

  return (
    <View className="flex-1 bg-background px-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Header Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
          <LinearGradient
            colors={['#064E3B', '#10B981']} // Emerald 900 -> Emerald 500
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-12 pb-6 items-center rounded-b-[40px] shadow-lg mb-8"
          >
            {/* ... content ... */}
            <Pressable onPress={() => pickAndUploadImage()} className="relative mb-4" disabled={isImageUploading}>
              <View className="h-28 w-28 bg-white/20 rounded-full items-center justify-center border-4 border-white/30 backdrop-blur-md shadow-xl overflow-hidden">
                {isImageUploading ? (
                  <View className="flex-1 items-center justify-center bg-black/20 w-full h-full">
                    <Feather name="loader" size={24} color="white" className="animate-spin" />
                  </View>
                ) : user?.image ? (
                  <Image source={{ uri: user.image }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <Text className="text-4xl font-bold text-white shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-secondary p-2 rounded-full border-2 border-white shadow-sm">
                <Feather name="camera" size={16} color="white" />
              </View>
            </Pressable>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              className="text-center font-bold text-2xl text-white border-0 bg-transparent min-w-[200px]"
              containerClassName="mb-1"
            />
            <Text className="text-emerald-50 text-sm font-medium tracking-wide">{user?.email}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Content */}
        <View>

          {/* Section: Physical Stats */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Section title="Physical Stats">
              {/* ... content ... */}
              <Row label="Weight" icon="activity">
                <Input
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="0"
                  className="text-right w-24 py-1 h-8"
                  containerClassName="mb-0"
                />
                <Text className="text-placeholder ml-2 text-xs">{unitSystem === 'imperial' ? 'lbs' : 'kg'}</Text>
              </Row>
              <Row label="Height" icon="bar-chart-2">
                <Input
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="0"
                  className="text-right w-24 py-1 h-8"
                  containerClassName="mb-0"
                />
                <Text className="text-placeholder ml-2 text-xs">{unitSystem === 'imperial' ? 'in' : 'cm'}</Text>
              </Row>
              <Row label="Gender" icon="user">
                <View className="flex-row bg-inputBackground rounded-lg p-1">
                  {['male', 'female'].map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      className={`px-3 py-1 rounded-md ${gender === g ? 'bg-background shadow-sm' : ''}`}
                    >
                      <Text className={`text-xs capitalize ${gender === g ? 'font-bold text-primary' : 'text-placeholder'}`}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              </Row>
              <Row label="Date of Birth" icon="calendar" isLast>
                <Pressable onPress={() => setShowDatePicker(true)} className="bg-inputBackground px-3 py-2 rounded border border-border">
                  <Text className="text-text text-sm">
                    {dateOfBirth ? dateOfBirth.toLocaleDateString() : "Set Date"}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </Row>
            </Section>
          </Animated.View>

          {/* Section: Goals */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Section title="My Goals">
              {/* ... content ... */}
              {isLoadingGoals ? (
                <View className="p-4 items-center">
                  <Text className="text-placeholder">Loading goals...</Text>
                </View>
              ) : (
                <View className="p-4">
                  {goals?.length === 0 ? (
                    <Text className="text-placeholder text-sm text-center italic py-2">No goals set yet.</Text>
                  ) : (
                    goals?.map((goal: any) => (
                      <View key={goal.id} className="flex-row items-center justify-between py-2 border-b border-border last:border-0">
                        <View>
                          <Text className="font-medium text-text capitalize">{goal.goalType.replace(/([A-Z])/g, ' $1').trim()}</Text>
                          <Text className="text-xs text-placeholder">Target: {goal.targetValue}</Text>
                        </View>
                        <Pressable onPress={() => {
                          showAlert(
                            "Coming Soon",
                            "Goal deletion will be available once sync is enabled.",
                            () => { },
                            undefined,
                            "OK",
                            undefined
                          )
                        }} className="p-2">
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
                        onPress={handleAddGoal}
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
          </Animated.View>

          {/* Section: Financial & Preferences */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Section title="Preferences & Details">
              {/* ... content ... */}
              <Row label="Income" icon="dollar-sign">
                <Input
                  value={income}
                  onChangeText={setIncome}
                  keyboardType="numeric"
                  placeholder="0.00"
                  className="text-right w-24 py-1 h-8"
                  containerClassName="mb-0"
                />
              </Row>
              <Row label="Currency" icon="credit-card">
                <Input
                  value={currency}
                  onChangeText={setCurrency}
                  placeholder="EGP"
                  className="text-right w-24 py-1 h-8"
                  containerClassName="mb-0"
                />
              </Row>
              <Row label="Unit System" icon="box">
                <View className="flex-row bg-inputBackground rounded-lg p-1">
                  <Pressable
                    onPress={() => setUnitSystem('metric')}
                    className={`px-3 py-1 rounded-md ${unitSystem === 'metric' ? 'bg-background shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs ${unitSystem === 'metric' ? 'font-bold text-primary' : 'text-placeholder'}`}>Metric</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setUnitSystem('imperial')}
                    className={`px-3 py-1 rounded-md ${unitSystem === 'imperial' ? 'bg-background shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs ${unitSystem === 'imperial' ? 'font-bold text-primary' : 'text-placeholder'}`}>Imperial</Text>
                  </Pressable>
                </View>
              </Row>
              <Row label="Theme" icon="moon" isLast>
                <View className="flex-row bg-inputBackground rounded-lg p-1">
                  {['light', 'dark', 'system'].map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setTheme(option);
                        // Update Uniwind theme
                        // Use require here to avoid import errors if types aren't perfect yet, 
                        // or better, strictly type if possible. 
                        // As per docs: import { Uniwind } from 'uniwind'
                        // but let's stick to the pattern if not imported yet.
                        // Actually, I'll add the import at the top.
                        // For now, let's assume Uniwind global is available or I will add import in next chunk.
                        const uniwindTheme = option === 'system' ? 'system' : option;
                        // @ts-ignore - Uniwind might not be typed in this project setup yet
                        import('uniwind').then(({ Uniwind }) => Uniwind.setTheme(uniwindTheme));

                        if (user) {
                          useAuthStore.getState().setUser({ ...user, theme: option });
                        }
                      }}
                      className={`px-3 py-1 rounded-md ${theme === option ? 'bg-background shadow-sm' : ''}`}
                    >
                      <Text className={`text-xs capitalize ${theme === option ? 'font-bold text-primary' : 'text-placeholder'}`}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              </Row>
            </Section>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <SyncSection />
          </Animated.View>

          {/* Save Action */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="mb-6">
            <Button
              onPress={handleSave}
              loading={isPending}
              variant="secondary"

            >
              Save Profile Changes
            </Button>
          </Animated.View>

          {/* Log Out */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)} className="mt-2 mb-10">
            <LogoutButton />
          </Animated.View>

        </View>

      </ScrollView>
    </View>
  )
}

import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList
} from "react-native"
import { Feather } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAuth } from "@/src/hooks/useAuth"
import { useAuthStore } from "@/src/store/useAuthStore"
import { useUpdate } from "@/src/hooks/useUpdate"
import { User } from "@/src/types/userType"
import { updateUser } from "@/src/lib/api/userApi"
import { runSync } from "@/src/services/sync"
import LogoutButton from "@/src/components/Buttons/LogoutButton"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchGoals, createGoal, deleteGoal } from "@/src/lib/api/goalsApi"
import { GoalType } from "@/src/types/goalType"

export default function ProfileSettings() {
  const { user, refetch } = useAuth()
  const { updateMutation } = useUpdate({ mutationFn: updateUser })
  const { mutate: updateUserMutation, isPending } = updateMutation
  const queryClient = useQueryClient()

  const [isSyncing, setIsSyncing] = useState(false)

  // Form State - initialized with user data
  // Using direct state for "in-place" editing experience
  const [name, setName] = useState(user?.name || "")
  const [weight, setWeight] = useState(user?.weight?.toString() || "")
  const [height, setHeight] = useState(user?.height?.toString() || "")
  const [unitSystem, setUnitSystem] = useState(user?.unitSystem || "metric")
  const [theme, setTheme] = useState(user?.theme || "system")
  const [currency, setCurrency] = useState(user?.currency || "EGP")

  // New Fields
  const [gender, setGender] = useState(user?.gender || "male")
  const [income, setIncome] = useState(user?.income?.toString() || "")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
  )
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Goals State
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalType, setNewGoalType] = useState<"loseWeight" | "gainWeight" | "bodyFat" | "muscleMass">("loseWeight")
  const [newGoalTarget, setNewGoalTarget] = useState("")

  // Fetch Goals
  const { data: goals, isLoading: isLoadingGoals } = useQuery({
    queryKey: ['userGoals', user?.id],
    queryFn: () => fetchGoals(user?.id),
    enabled: !!user?.id
  })

  // Create Goal Mutation
  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals'] })
      setShowAddGoal(false)
      setNewGoalTarget("")
      Alert.alert("Success", "Goal added!")
    }
  })

  // Delete Goal Mutation
  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals'] })
    }
  })

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await runSync()
      if (result.pullSuccess && result.pushSuccess) {
        Alert.alert("Synced", `Pulled: ${result.pulled}, Pushed: ${result.pushed}`)
      } else {
        Alert.alert("Sync Issue", "Some data might not have synced.")
      }
    } catch (e) {
      Alert.alert("Error", "Failed to sync.")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSave = () => {
    if (!user?.id) return

    const updatedFields: Partial<User> = {
      name,
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
          refetch()
          Alert.alert("Saved", "Profile updated.")
        },
        onError: (e) => Alert.alert("Error", e.message),
      }
    )
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth
    setShowDatePicker(Platform.OS === "ios")
    setDateOfBirth(currentDate)
  }

  const handleAddGoal = () => {
    if (!user?.id) return
    if (!newGoalTarget) {
      Alert.alert("Error", "Please enter a target value")
      return
    }

    createGoalMutation.mutate({
      userId: user.id,
      goalType: newGoalType,
      targetValue: parseFloat(newGoalTarget),
      // deadline: null 
    })
  }

  // Helper Component for Settings Row
  const SettingRow = ({ label, icon, isLast = false, children }: any) => (
    <View className={`flex-row items-center py-4 px-4 ${!isLast ? "border-b border-gray-100" : ""} bg-white`}>
      <View className="w-8 items-center justify-center mr-3">
        <Feather name={icon} size={20} color="#4b5563" />
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-base text-gray-900 font-medium">{label}</Text>
      </View>
      <View className="flex-row items-center justify-end" style={{ minWidth: 100 }}>
        {children}
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Profile Card */}
        <View className="bg-white p-6 pb-8 items-center border-b border-gray-200 rounded-b-3xl shadow-sm mb-6">
          <View className="h-24 w-24 bg-emerald-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
            <Text className="text-3xl font-bold text-emerald-600">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            className="text-xl font-bold text-gray-900 mb-1 text-center border-b border-transparent focus:border-emerald-500"
            placeholder="Your Name"
          />
          <Text className="text-gray-500 text-sm mb-4">{user?.email}</Text>
        </View>

        {/* Content */}
        <View className="px-4">

          {/* Section: Physical Stats */}
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">Physical Stats</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <SettingRow label="Weight" icon="activity">
              <TextInput
                className="text-right text-gray-900 p-1 w-24 bg-gray-50 rounded px-2"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text className="text-gray-400 ml-2 text-xs">{unitSystem === 'imperial' ? 'lbs' : 'kg'}</Text>
            </SettingRow>
            <SettingRow label="Height" icon="bar-chart-2">
              <TextInput
                className="text-right text-gray-900 p-1 w-24 bg-gray-50 rounded px-2"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text className="text-gray-400 ml-2 text-xs">{unitSystem === 'imperial' ? 'in' : 'cm'}</Text>
            </SettingRow>
            <SettingRow label="User Gender" icon="user">
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                {['male', 'female'].map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    className={`px-3 py-1 rounded-md ${gender === g ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs capitalize ${gender === g ? 'font-bold text-emerald-600' : 'text-gray-500'}`}>{g}</Text>
                  </Pressable>
                ))}
              </View>
            </SettingRow>
            <SettingRow label="Date of Birth" icon="calendar" isLast>
              <Pressable onPress={() => setShowDatePicker(true)} className="bg-gray-50 px-3 py-2 rounded">
                <Text className="text-gray-900 text-sm">
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
            </SettingRow>
          </View>

          {/* Section: Goals */}
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">My Goals</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6 p-4">
            {isLoadingGoals ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <View>
                {goals?.length === 0 ? (
                  <Text className="text-gray-400 text-sm text-center italic py-2">No goals set yet.</Text>
                ) : (
                  goals?.map((goal: any) => (
                    <View key={goal.id} className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <View>
                        <Text className="font-medium text-gray-700 capitalize">{goal.goalType.replace(/([A-Z])/g, ' $1').trim()}</Text>
                        <Text className="text-xs text-gray-400">Target: {goal.targetValue}</Text>
                      </View>
                      <Pressable onPress={() => deleteGoalMutation.mutate(goal.id)} className="p-2">
                        <Feather name="trash-2" size={16} color="#ef4444" />
                      </Pressable>
                    </View>
                  ))
                )}

                <Pressable
                  onPress={() => setShowAddGoal(!showAddGoal)}
                  className="mt-3 flex-row items-center justify-center py-2 bg-emerald-50 rounded-xl"
                >
                  <Feather name={showAddGoal ? "minus" : "plus"} size={16} color="#10b981" />
                  <Text className="text-emerald-600 font-medium ml-2">{showAddGoal ? "Cancel" : "Add Goal"}</Text>
                </Pressable>

                {showAddGoal && (
                  <View className="mt-4 bg-gray-50 p-3 rounded-xl">
                    <Text className="text-xs font-bold text-gray-500 mb-2 uppercase">Goal Type</Text>
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      {["loseWeight", "gainWeight", "bodyFat", "muscleMass"].map((t) => (
                        <Pressable
                          key={t}
                          onPress={() => setNewGoalType(t as any)}
                          className={`px-3 py-1.5 rounded-full border ${newGoalType === t ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`text-xs ${newGoalType === t ? 'text-emerald-700 font-bold' : 'text-gray-600'}`}>
                            {t.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text className="text-xs font-bold text-gray-500 mb-2 uppercase">Target Value</Text>
                    <TextInput
                      value={newGoalTarget}
                      onChangeText={setNewGoalTarget}
                      keyboardType="numeric"
                      className="bg-white border border-gray-200 rounded-lg p-2 mb-3"
                      placeholder="e.g. 75"
                    />

                    <Pressable
                      onPress={handleAddGoal}
                      disabled={createGoalMutation.isPending}
                      className="bg-emerald-600 rounded-lg py-3 items-center"
                    >
                      {createGoalMutation.isPending ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text className="text-white font-bold text-sm">Save Goal</Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Section: Financial & Preferences */}
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">Preferences & Details</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <SettingRow label="Income" icon="dollar-sign">
              <TextInput
                className="text-right text-gray-900 p-1 w-24 bg-gray-50 rounded px-2"
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </SettingRow>
            <SettingRow label="Currency" icon="credit-card">
              <TextInput
                className="text-right text-gray-900 p-1 w-24 bg-gray-50 rounded px-2"
                value={currency}
                onChangeText={setCurrency}
                placeholder="EGP"
              />
            </SettingRow>
            <SettingRow label="Unit System" icon="box">
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                <Pressable
                  onPress={() => setUnitSystem('metric')}
                  className={`px-3 py-1 rounded-md ${unitSystem === 'metric' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Text className={`text-xs ${unitSystem === 'metric' ? 'font-bold' : 'text-gray-500'}`}>Metric</Text>
                </Pressable>
                <Pressable
                  onPress={() => setUnitSystem('imperial')}
                  className={`px-3 py-1 rounded-md ${unitSystem === 'imperial' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Text className={`text-xs ${unitSystem === 'imperial' ? 'font-bold' : 'text-gray-500'}`}>Imperial</Text>
                </Pressable>
              </View>
            </SettingRow>
            <SettingRow label="Theme" icon="moon" isLast>
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                {['light', 'dark', 'system'].map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setTheme(option);
                      if (user) {
                        useAuthStore.getState().setUser({ ...user, theme: option });
                      }
                    }}
                    className={`px-3 py-1 rounded-md ${theme === option ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs capitalize ${theme === option ? 'font-bold' : 'text-gray-500'}`}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            </SettingRow>
          </View>

          {/* Section: App Data */}
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">Sync</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <Pressable
              onPress={handleSync}
              disabled={isSyncing}
            >
              <View className="flex-row items-center py-4 px-4 bg-white active:bg-gray-50">
                <View className="w-8 items-center justify-center mr-3">
                  <Feather name="refresh-cw" size={20} color={isSyncing ? "#10b981" : "#4b5563"} />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">Sync Data</Text>
                  <Text className="text-xs text-gray-400">Push local changes to cloud</Text>
                </View>
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                )}
              </View>
            </Pressable>
          </View>

          {/* Save Action */}
          <Pressable onPress={handleSave} className="bg-emerald-600 rounded-2xl py-4 mb-6 shadow-md shadow-emerald-200 active:bg-emerald-700">
            {isPending ? <ActivityIndicator color="white" /> : <Text className="text-center text-white font-bold text-lg">Save Profile Changes</Text>}
          </Pressable>

          {/* Log Out */}
          <View className="mt-2 mb-10">
            <LogoutButton />
          </View>

        </View>

      </ScrollView>
    </View>
  )
}

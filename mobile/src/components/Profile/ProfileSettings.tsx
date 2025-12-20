import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  Platform,
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
import UserProfile from "./UserProfile"

export default function ProfileSettings() {
  const { user, refetch } = useAuth()
  const { updateMutation } = useUpdate({ mutationFn: updateUser })
  const { mutate: updateUserMutation, isPending } = updateMutation

  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Form State
  const [name, setName] = useState(user?.name || "")
  const [weight, setWeight] = useState(user?.weight?.toString() || "")
  const [height, setHeight] = useState(user?.height?.toString() || "")
  const [unitSystem, setUnitSystem] = useState(user?.unitSystem || "metric")
  const [theme, setTheme] = useState(user?.theme || "system")
  const [currency, setCurrency] = useState(user?.currency || "EGP")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
  )
  const [showDatePicker, setShowDatePicker] = useState(false)

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
      dateOfBirth: dateOfBirth?.toISOString().split("T")[0],
    }

    updateUserMutation(
      { id: user.id, ...updatedFields },
      {
        onSuccess: () => {
          setIsEditing(false)
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

  // Helper Component for Settings Row
  const SettingRow = ({ label, value, icon, isLast = false, children }: any) => (
    <View className={`flex-row items-center py-4 px-4 ${!isLast ? "border-b border-gray-100" : ""} bg-white`}>
      <View className="w-8 items-center justify-center mr-3">
        <Feather name={icon} size={20} color="#4b5563" />
      </View>
      <View className="flex-1">
        <Text className="text-base text-gray-900 font-medium">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {children ? (
          children
        ) : (
          <Text className="text-gray-500 text-sm">{value || "Not set"}</Text>
        )}
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
          <Text className="text-xl font-bold text-gray-900 mb-1">{user?.name || "User"}</Text>
          <Text className="text-gray-500 text-sm mb-4">{user?.email}</Text>

          <Pressable
            onPress={() => setIsEditing(!isEditing)}
            className={`flex-row items-center px-5 py-2 rounded-full ${isEditing ? 'bg-gray-200' : 'bg-gray-100'}`}
          >
            <Feather name={isEditing ? "x" : "edit-2"} size={14} color="#374151" />
            <Text className="ml-2 text-gray-700 font-medium text-sm">
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-4">

          {/* Section: Physical Stats */}
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">Physical Stats</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <SettingRow label="Weight" icon="activity" value={`${weight} ${user?.unitSystem === 'imperial' ? 'lbs' : 'kg'}`}>
              {isEditing && (
                <TextInput
                  className="text-right text-gray-900 border-b border-gray-200 p-1 w-20"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="0"
                />
              )}
            </SettingRow>
            <SettingRow label="Height" icon="bar-chart-2" value={`${height} ${user?.unitSystem === 'imperial' ? 'in' : 'cm'}`} isLast>
              {isEditing && (
                <TextInput
                  className="text-right text-gray-900 border-b border-gray-200 p-1 w-20"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="0"
                />
              )}
            </SettingRow>
          </View>

          {/* Section: Preferences */}
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">Preferences</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <SettingRow label="Unit System" icon="box">
              {isEditing ? (
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
              ) : (
                <Text className="text-gray-500 text-sm capitalize">{unitSystem}</Text>
              )}
            </SettingRow>
            <SettingRow label="Currency" icon="dollar-sign" value={currency} isLast>
              {isEditing && (
                <TextInput
                  className="text-right text-gray-900 border-b border-gray-200 p-1 w-20"
                  value={currency}
                  onChangeText={setCurrency}
                />
              )}
            </SettingRow>
          </View>

          {/* Section: Appearance */}
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">Appearance</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
            <SettingRow label="Theme" icon="moon" isLast>
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                {['light', 'dark', 'system'].map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (isEditing) {
                        setTheme(option);
                        // Optimistic update for instant preview
                        if (user) {
                          useAuthStore.getState().setUser({ ...user, theme: option });
                        }
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
          <Text className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">Data & Sync</Text>
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
          {isEditing && (
            <Pressable onPress={handleSave} className="bg-emerald-600 rounded-2xl py-4 mb-6 shadow-md shadow-emerald-200 active:bg-emerald-700">
              {isPending ? <ActivityIndicator color="white" /> : <Text className="text-center text-white font-bold text-lg">Save Changes</Text>}
            </Pressable>
          )}

          {/* Log Out */}
          <View className="mt-8 mb-10">
            <LogoutButton />
          </View>

        </View>

      </ScrollView>

      {/* Date Picker Modal if needed, ignoring for now as simple redesign */}
    </View>
  )
}

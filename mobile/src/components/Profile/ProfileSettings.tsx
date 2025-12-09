import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Pressable,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAuth } from "@/src/hooks/useAuth"
import { ProfileOption } from "@/src/components/ui/ProfileOption"
import { useUpdate } from "@/src/hooks/useUpdate"
import { User } from "@/src/types/userType"
import { updateUser } from "@/src/lib/api/userApi"
import UserProfile from "./UserProfile"
import LogoutButton from "@/src/components/Buttons/LogoutButton"

export default function ProfileSettings() {
  const { user, refetch } = useAuth()
  const { updateMutation } = useUpdate({ mutationFn: updateUser })
  const { mutate: updateUserMutation, isPending } = updateMutation

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [gender, setGender] = useState(user?.gender || "")
  const [weight, setWeight] = useState(user?.weight?.toString() || "")
  const [height, setHeight] = useState(user?.height?.toString() || "")
  const [unitSystem, setUnitSystem] = useState(user?.unitSystem || "metric")
  const [income, setIncome] = useState(user?.income?.toString() || "")
  const [currency, setCurrency] = useState(user?.currency || "EGP")
  const [image, setImage] = useState(user?.image || "")

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth
    setShowDatePicker(Platform.OS === "ios")
    setDateOfBirth(currentDate)
  }

  const handleSaveChanges = () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated.")
      return
    }

    const updatedFields: Partial<User> = {
      name,
      email,
      dateOfBirth: dateOfBirth?.toISOString().split("T")[0],
      gender: gender || null,
      weight: weight ? parseInt(weight, 10) : null,
      height: height ? parseInt(height, 10) : null,
      unitSystem,
      income: income ? parseFloat(income) : null,
      currency,
      image: image || null,
    }

    updateUserMutation(
      { id: user.id, ...updatedFields },
      {
        onSuccess: () => {
          Alert.alert("Success", "Profile updated successfully!")
          refetch()
        },
        onError: (error: Error) => {
          Alert.alert("Error", "Failed to update profile: " + error.message)
        },
      }
    )
  }

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 100 }} 
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
      <UserProfile />

      <View className="px-2">
        {/* Personal Information Card */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Personal Information
          </Text>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Name</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base mb-3"
            placeholder="Enter your name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base mb-3"
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Date of Birth
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3"
          >
            <Text className="text-gray-900 text-base">
              {dateOfBirth ? dateOfBirth.toDateString() : "Select Date of Birth"}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <ProfileOption
            label="Gender"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
            selectedValue={gender}
            onValueChange={setGender}
          />
        </View>

        {/* Physical Details Card */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Physical Details
          </Text>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Weight ({unitSystem === "metric" ? "kg" : "lbs"})
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base mb-3"
            placeholder="Enter your weight"
            placeholderTextColor="#9ca3af"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Height ({unitSystem === "metric" ? "cm" : "inches"})
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base mb-3"
            placeholder="Enter your height"
            placeholderTextColor="#9ca3af"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />

          <ProfileOption
            label="Unit System"
            options={[
              { label: "Metric (kg, cm)", value: "metric" },
              { label: "Imperial (lbs, inches)", value: "imperial" },
            ]}
            selectedValue={unitSystem}
            onValueChange={setUnitSystem}
          />
        </View>

        {/* Preferences Card */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Preferences
          </Text>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Monthly Income
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base mb-3"
            placeholder="Enter your income"
            placeholderTextColor="#9ca3af"
            value={income}
            onChangeText={setIncome}
            keyboardType="numeric"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Currency
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base mb-3"
            placeholder="e.g., USD, EUR, EGP"
            placeholderTextColor="#9ca3af"
            value={currency}
            onChangeText={setCurrency}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Profile Image URL
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base"
            placeholder="Enter image URL"
            placeholderTextColor="#9ca3af"
            value={image}
            onChangeText={setImage}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-1 m-auto w-32 gap-3">
          {/* Save Button */}
          <Pressable
            className={`${
              isPending ? "bg-gray-300" : "bg-emerald-600"
            } rounded-2xl py-2 items-center active:bg-emerald-700`}
            onPress={handleSaveChanges}
            disabled={isPending}
          >
            <Text className="flex-1 text-white font-bold text-lg">
              {isPending ? "Saving..." : "Save"}
            </Text>
          </Pressable>

          {/* Logout Button */}
          <LogoutButton />
        </View>
      </View>
    </ScrollView>
  )
}

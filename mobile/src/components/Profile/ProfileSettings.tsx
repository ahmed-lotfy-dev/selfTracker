import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAuth } from "@/src/hooks/useAuth"
import { SelectComponent } from "@/src/components/ui/Select"
import * as SelectPrimitive from "@rn-primitives/select"
import { ProfileOption } from "@/src/components/ui/ProfileOption"
import { useUpdate } from "@/src/hooks/useUpdate"
import { User } from "@/src/types/userType"
import { updateUser } from "@/src/lib/api/userApi" // Import the updateUser API function
import UserProfile from "./UserProfile" // Re-using the UserProfile component for image display
import { COLORS, useThemeColors } from "@/src/constants/Colors"

export default function ProfileSettings() {
  const { user, refetch } = useAuth()
  const { updateMutation } = useUpdate({ mutationFn: updateUser })
  const { mutate: updateUserMutation, isPending } = updateMutation
  const colors = useThemeColors()

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
      dateOfBirth: dateOfBirth?.toISOString().split("T")[0], // Format to YYYY-MM-DD
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
          refetch() // Use the refetch function from useAuth
        },
        onError: (error: Error) => {
          Alert.alert("Error", "Failed to update profile: " + error.message)
        },
      }
    )
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="pt-3">
      <UserProfile />
      <View
        style={{ marginHorizontal: 12, flex: 1, gap: 12, marginVertical: 40 }}
      >
        {/* Personal Information Card */}
        <View className="bg-white p-4 rounded-lg shadow-md mb-6">
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: COLORS.primary,
              marginBottom: 16,
            }}
          >
            Personal Information
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Name
          </Text>
          <TextInput
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.background,
              marginBottom: 12,
            }}
            placeholder="Name"
            placeholderTextColor={COLORS.primary}
            value={name}
            onChangeText={setName}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Email
          </Text>
          <TextInput
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.inputText,
              marginBottom: 12,
            }}
            placeholder="Email"
            placeholderTextColor={COLORS.primary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Date of Birth
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.inputText }}>
              {dateOfBirth
                ? dateOfBirth.toDateString()
                : "Select Date of Birth"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              className="text-black"
              mode="date"
              display="default"
              onChange={handleDateChange}
              textColor={colors.text} // This might not work directly for native pickers, but good to include
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
        <View className="bg-white p-4 rounded-lg shadow-md mb-6">
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: COLORS.primary,
              marginBottom: 16,
            }}
          >
            Physical Details
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Weight
          </Text>
          <TextInput
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.inputText,
              marginBottom: 12,
            }}
            placeholder="Weight"
            placeholderTextColor={COLORS.primary}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Height
          </Text>
          <TextInput
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.inputText,
              marginBottom: 12,
            }}
            placeholder="Height"
            placeholderTextColor={COLORS.primary}
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

        {/* Financial Details Card */}
        <View className="bg-white p-4 rounded-lg shadow-md mb-6">
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: COLORS.primary,
              marginBottom: 16,
            }}
          >
            Financial Details
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Income
          </Text>
          <TextInput
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.inputText,
              marginBottom: 12,
            }}
            placeholder="Income"
            placeholderTextColor={COLORS.primary}
            value={income}
            onChangeText={setIncome}
            keyboardType="numeric"
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Currency
          </Text>
          <TextInput
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.inputText,
              marginBottom: 12,
            }}
            placeholder="Currency"
            placeholderTextColor={COLORS.primary}
            value={currency}
            onChangeText={setCurrency}
          />

          {/* Image input - for simplicity, this might be a text input for a URL or a more complex image picker */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 4,
              color: COLORS.inputText,
            }}
          >
            Profile Image URL
          </Text>
          <TextInput
            style={{
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.inputText,
            }}
            placeholder="Profile Image URL"
            placeholderTextColor={COLORS.primary}
            value={image}
            onChangeText={setImage}
          />
        </View>

        <TouchableOpacity
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            alignItems: "center",
            marginTop: 24,
            backgroundColor: colors.success,
          }}
          onPress={handleSaveChanges}
          disabled={isPending}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: colors.background,
            }}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

interface ProfileSelectProps {
  options: { label: string; value: string }[]
  selectedValue: string
  onValueChange: (value: string) => void
  label: string
}

const ProfileSelect = ({
  options,
  selectedValue,
  onValueChange,
  label,
}: ProfileSelectProps) => {
  const colors = useThemeColors()
  const selectedOption = options.find(
    (option) => option.value === selectedValue
  )

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "500",
          marginBottom: 4,
          color: colors.inputText,
        }}
      >
        {label}
      </Text>
      <SelectPrimitive.Root
        value={selectedOption}
        onValueChange={(option: SelectPrimitive.Option | undefined) => {
          if (option) {
            onValueChange(option.value)
          }
        }}
      >
        <SelectPrimitive.Trigger
          style={{
            padding: 8,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
            height: 40, // Adjust height to match TextInput
            justifyContent: "center",
          }}
        >
          <SelectPrimitive.Value
            placeholder={`Select a ${label}`}
            style={{ color: colors.inputText }}
          />
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Overlay />
          <SelectPrimitive.Content>
            <SelectPrimitive.ScrollUpButton />
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Group>
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  >
                    <Text>{option.label}</Text>
                    <SelectPrimitive.ItemIndicator />
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton />
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </View>
  )
}

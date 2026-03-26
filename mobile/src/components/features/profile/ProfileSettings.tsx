import React, { useState } from "react"
import { View, ScrollView } from "react-native"
import { useAuthStore } from "@/src/features/auth/useAuthStore"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import { User } from "@/src/types/userType"
import LogoutButton from "@/src/components/features/auth/LogoutButton"
import { updateUser } from "@/src/lib/api/userApi"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useProfileImage } from "@/src/hooks/useProfileImage"
import { PremiumCard } from "@/src/components/ui/PremiumCard"
import { Feather } from "@expo/vector-icons"
import { Text } from "react-native"

// Sub-components
import ProfileHero from "./ProfileHero"
import PhysicalStatsSection from "./PhysicalStatsSection"
import GoalsSection from "./GoalsSection"
import PreferencesSection from "./PreferencesSection"
import SyncSection from "./SyncSection"

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore()
  const { showAlert } = useAlertStore()

  const [isPending, setIsPending] = useState(false)
  const { pickAndUploadImage, isUploading: isImageUploading } = useProfileImage()

  // Form State
  const [name, setName] = useState(user?.name || "")
  const [weight, setWeight] = useState(user?.weight?.toString() || "")
  const [height, setHeight] = useState(user?.height?.toString() || "")
  const [unitSystem, setUnitSystem] = useState(user?.unitSystem || "metric")
  const [theme, setTheme] = useState(user?.theme || "system")
  const [currency, setCurrency] = useState(user?.currency || "EGP")
  const [gender, setGender] = useState(user?.gender || "male")
  const [income, setIncome] = useState(user?.income?.toString() || "")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
  )
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Goals State (WIP)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalType, setNewGoalType] = useState<any>("loseWeight")
  const [newGoalTarget, setNewGoalTarget] = useState("")

  const handleSave = async () => {
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

    try {
      setIsPending(true)
      const updatedUser = await updateUser({ id: user.id, ...updatedFields })
      setUser({ ...user, ...updatedUser })
      showAlert("Saved", "Profile updated successfully!", () => { }, undefined, "Got it", "Cancel", "success")
    } catch (e: any) {
      console.error(e)
      showAlert("Error", e.message || "Failed to update profile", () => { }, undefined, "Close", "Cancel", "error")
    } finally {
      setIsPending(false)
    }
  }

  const handleAddGoal = () => {
    showAlert("Coming Soon", "Goal tracking will be available once sync is enabled.", () => { }, undefined, "Got it", "Cancel", "default")
  }

  const handleDeleteGoal = (goal: any) => {
    showAlert("Coming Soon", "Goal deletion will be available soon.", () => { }, undefined, "Got it", "Cancel", "default")
  }

  return (
    <View className="flex-1 bg-background px-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mb-8">
          <ProfileHero 
            user={user}
            name={name}
            setName={setName}
            isImageUploading={isImageUploading}
            onPickImage={pickAndUploadImage}
          />
        </Animated.View>

        <View>
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <PhysicalStatsSection 
              weight={weight}
              setWeight={setWeight}
              height={height}
              setHeight={setHeight}
              gender={gender}
              setGender={setGender}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              unitSystem={unitSystem}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <GoalsSection 
              goals={[]} // WIP
              isLoading={false}
              showAddGoal={showAddGoal}
              setShowAddGoal={setShowAddGoal}
              newGoalType={newGoalType}
              setNewGoalType={setNewGoalType}
              newGoalTarget={newGoalTarget}
              setNewGoalTarget={setNewGoalTarget}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <PreferencesSection 
              income={income}
              setIncome={setIncome}
              currency={currency}
              setCurrency={setCurrency}
              unitSystem={unitSystem}
              setUnitSystem={setUnitSystem}
              theme={theme}
              setTheme={setTheme}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <SyncSection />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="mb-6 px-4">
            <PremiumCard 
              onPress={handleSave}
              gradientColors={['#10b981', '#059669']}
              containerStyle="h-14 justify-center"
            >
              <View className="flex-row items-center justify-center">
                {isPending ? (
                  <Feather name="loader" size={18} color="white" className="animate-spin" />
                ) : (
                  <Feather name="refresh-cw" size={16} color="white" />
                )}
                <Text className="text-white text-sm font-black uppercase tracking-[2px] ml-3">
                  {isPending ? "Synchronizing..." : "Sync Profile Changes"}
                </Text>
              </View>
            </PremiumCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).duration(500)} className="mt-2 mb-10">
            <LogoutButton />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  )
}

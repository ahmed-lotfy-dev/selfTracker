import React from "react"
import Header from "@/src/components/Header"
import { View } from "react-native"
import ProfileSettings from "@/src/components/Profile/ProfileSettings" // Import the new ProfileSettings component
import { useThemeColors } from "@/src/constants/Colors"

export default function Profile() {
  const colors = useThemeColors()
  return (
    <View className={`flex-1 mt-10 bg-[${colors.background}]`}>
      <Header title="Settings" />
      <ProfileSettings />
    </View>
  )
}

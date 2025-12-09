import React from "react"
import Header from "@/src/components/Header"
import { View } from "react-native"
import ProfileSettings from "@/src/components/Profile/ProfileSettings" // Import the new ProfileSettings component

export default function Profile() {
  return (
    <View className="flex-1 bg-gray-50 px-3 pt-3">
      <Header title="Settings" />
      <ProfileSettings />
    </View>
  )
}

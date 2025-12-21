import React from "react"
import Header from "@/src/components/Header"
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import { View } from "react-native"
import ProfileSettings from "@/src/components/features/profile/ProfileSettings" // Import the new ProfileSettings component

export default function Profile() {
  return (
    <View className="flex-1 bg-background px-2">
      <Header
        title="Settings"
        rightAction={<DrawerToggleButton />}
      />
      <ProfileSettings />
    </View>
  )
}

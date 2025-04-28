import LogoutButton from "@/src/components/Buttons/LogoutButton"
import Header from "@/src/components/Header"
import UserImage from "@/src/components/Profile/UserProfile"
import { Text, View } from "react-native"

export default function Profile() {
  return (
    <View className="flex-1 ">
      <UserImage />

      <LogoutButton className="mt-2" />
    </View>
  )
}

import ProfileImage from "@/components/Profile/ProfileImage"
import UserProfile from "@/components/UserProfile"
import { useUser } from "@/store/useAuthStore"
import { Text, View } from "react-native"

export default function Profile() {
  const user = useUser()
  console.log({ user })
  return (
    <View className="flex-1 justify-center items-center">
      <UserProfile />
      <ProfileImage />
      <View></View>
    </View>
  )
}

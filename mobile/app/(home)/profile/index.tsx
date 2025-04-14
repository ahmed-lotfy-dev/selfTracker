import UserImage from "@/components/Profile/UserImage"
import { useUser } from "@/store/useAuthStore"
import { Text, View } from "react-native"

export default function Profile() {
  const user = useUser()
  console.log({ user })
  return (
    <View className="flex-1 ">
      <UserImage />
    </View>
  )
}

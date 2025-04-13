import { View, Text, ActivityIndicator, Image } from "react-native"
import LogoutButton from "./logoutButton"
import Fontisto from "@expo/vector-icons/Fontisto"
import { useAuth } from "@/hooks/useAuth"

export default function UserProfile() {
  const { user ,isLoading} = useAuth()
  console.log(user, "from inside user profile")

    if (isLoading) {
      return <Text>Loading...</Text>
    }

    if (!user) {
      return <Text>No user data available</Text>
    }

  return (
    <View className="flex-1 flex-col items-center p-4">
      <View className="flex-row justify-center items-center gap-3">
        {!user?.profileImage && (
          <Fontisto
            name="male"
            size={36}
            color="black"
            className="w-20 h-20 rounded-full border"
          />
        )}

        <Image
          source={{ uri: user?.profileImage }}
          className="w-20 h-20 rounded-full border "
        />

        <Text className="text-lg font-bold">
          {user?.name ? user.name : "No Name"}
        </Text>
      </View>
      <LogoutButton className="mt-4" />
    </View>
  )
}

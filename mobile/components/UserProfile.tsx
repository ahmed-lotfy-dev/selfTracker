import { View, Text, ActivityIndicator, Image } from "react-native"
import { useQuery } from "@tanstack/react-query"
import { userData } from "@/utils/api/authApi"
import LogoutButton from "./logoutButton"

export default function UserProfile() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: userData,
  })

  if (isLoading) {
    return (
      <View className="justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (isError || !user) {
    return (
      <View className="justify-center items-center">
        <Text className="text-red-500">Failed to load user data</Text>
      </View>
    )
  }

  return (
    <View className="items-center p-4">
      <View className="flex-row justify-center items-center gap-3">
        <Image
          className="w-10 h-10 rounded-full border border-green-500"
          source={{
            uri: "https://placehold.co/200x200/gray/eee",
            width: 50,
            height: 50,
            scale: 1.5,
          }}
        />
        <Text className="text-lg font-bold">
          {user.user.name ? user.user.name : "No Name"}
        </Text>
      </View>
      <LogoutButton className="mt-4" />
    </View>
  )
}

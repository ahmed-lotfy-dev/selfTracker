import { View, Text, Image } from "react-native"
import React from "react"
import UploadImageBtn from "./UploadImageBtn"
import { useAuth } from "@/src/hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"

interface UserImageProps {
  homeScreen?: boolean
  className?: string
}

export default function UserProfile({
  homeScreen = false,
  className,
}: UserImageProps) {
  const { user } = useAuth()

  if (homeScreen) {
    return (
      <View className={`flex-row items-center gap-3 ${className}`}>
        {!user?.image ? (
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={28} color="#6b7280" />
          </View>
        ) : (
          <Image
            source={{ uri: user.image }}
            className="w-14 h-14 rounded-full"
          />
        )}
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 capitalize">
            {user?.name}
          </Text>
          <Text className="text-sm text-gray-500">{user?.email}</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`items-center py-6 ${className}`}>
      <View className="relative">
        {!user?.image ? (
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center border-4 border-white shadow-md">
            <Ionicons name="person" size={48} color="#6b7280" />
          </View>
        ) : (
          <Image
            source={{ uri: user.image }}
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
        )}
        <View className="absolute -bottom-1 -right-1">
          <UploadImageBtn className="w-9 h-9 rounded-full" />
        </View>
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mt-4 capitalize">
        {user?.name}
      </Text>
      <Text className="text-sm text-gray-500 mt-1">{user?.email}</Text>
    </View>
  )
}

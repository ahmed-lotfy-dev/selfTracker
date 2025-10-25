import { View, Text, Image } from "react-native"
import React, { useEffect } from "react"
import Fontisto from "@expo/vector-icons/Fontisto"
import UploadImageBtn from "./UploadImageBtn"
import { useAuth } from "@/src/hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"

interface UserImageProps {
  homeScreen?: boolean
  className?: string
}

export default function UserPofile({
  homeScreen = false,
  className,
}: UserImageProps) {
  const { user } = useAuth()

  return (
    <View className={`flex-1 justify-center items-center ${className}`}>
      <View
        className={`w-full flex-row items-center gap-3 relative ${
          homeScreen ? "justify-start pl-2" : "flex-col justify-center"
        } `}
      >
        {!user?.image ? (
          <Ionicons
            name="person"
            size={homeScreen ? 45 : 80}
            color="black"
            className={`w-full justify-center items-center rounded-xl border border-gray-400 ${
              homeScreen ? "w-16 h-16 p-2" : "w-24 h-24 p-2"
            }`}
          />
        ) : (
          <Image
            source={{ uri: user.image }}
            className={`rounded-xl border ${
              homeScreen ? "w-14 h-14" : "w-24 h-24"
            }`}
          />
        )}
        <View className="flex-1 mt-2">
          <View
            className={`flex-row items-center mb-1  ${homeScreen ? "justify-start" : "justify-center"}`}
          >
            <Text className="text-md font-bold capitalize flex-1">
              {user?.name}
            </Text>
          </View>
          <Text className="flex-1 capitalizes">{user?.email}</Text>
        </View>
      </View>

      {!homeScreen && (
        <>
          <UploadImageBtn className="mt-4 w-10 h-10 z-10 absolute translate-x-6 translate-y-1 rounded-full" />
        </>
      )}
    </View>
  )
}

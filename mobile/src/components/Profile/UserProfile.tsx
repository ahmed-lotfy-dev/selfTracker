import { View, Text, Image } from "react-native"
import React, { useEffect } from "react"
import Fontisto from "@expo/vector-icons/Fontisto"
import UploadImageBtn from "./UploadImageBtn"
import { useAuth } from "@/src/hooks/useAuth"

interface UserImageProps {
  homeScreen?: boolean
  className?: string
}

export default function UserP({
  homeScreen = false,
  className,
}: UserImageProps) {
  const { user } = useAuth()

  return (
    <View
      className={`justify-center items-center ${
        homeScreen ? "mb-4" : "my-4"
      } ${className}`}
    >
      <View
        className={`w-full flex-row items-center gap-3 relative ${
          homeScreen ? "justify-start pl-2" : "flex-col justify-center"
        }`}
      >
        {!user?.image ? (
          <Fontisto
            name="male"
            size={homeScreen ? 32 : 36}
            color="black"
            className={`rounded-xl border ${
              homeScreen ? "w-16 h-16" : "w-24 h-24"
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
          <View className="flex-row justify-start items-center mb-1">
            <Text className="text-md font-bold">Welome back:</Text>
            <Text
              className="text-md font-bold ml-1 capitalize"
              numberOfLines={1}
            >
              {user?.name.split(" ")[0]}
            </Text>
          </View>
          <Text>{user.email}</Text>
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

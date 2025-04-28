import { View, Text, Image } from "react-native"
import React, { useEffect } from "react"
import Fontisto from "@expo/vector-icons/Fontisto"
import UploadImageBtn from "./UploadImageBtn"
import LogoutButton from "../Buttons/LogoutButton"
import { useAuth } from "@/src/hooks/useAuth"

interface UserImageProps {
  homeScreen?: boolean
  className?: string
}

export default function UserImage({
  homeScreen = false,
  className,
}: UserImageProps) {
  const { user } = useAuth()

  return (
    <View
      className={`justify-center items-center ${
        homeScreen ? "mb-2" : "my-4"
      } ${className}`}
    >
      <View
        className={`flex-row items-center gap-3 ${
          homeScreen ? "w-full justify-start pl-2" : "justify-center"
        }`}
      >
        {!user?.image ? (
          <Fontisto
            name="male"
            size={homeScreen ? 32 : 36}
            color="black"
            className={`rounded-full border ${
              homeScreen ? "w-16 h-16" : "w-20 h-20"
            }`}
          />
        ) : (
          <Image
            source={{ uri: user.image }}
            className={`rounded-full border ${
              homeScreen ? "w-14 h-14" : "w-20 h-20"
            }`}
          />
        )}

        {homeScreen && (
          <View className="flex-1 flex-row items-center">
            <Text className="text-md font-bold mr-2">Welome back:</Text>
            <Text className="text-lg font-bold capitalize" numberOfLines={1}>
              {user?.name.split(" ")[0]}
            </Text>
          </View>
        )}
      </View>

      {!homeScreen && (
        <>
          <UploadImageBtn className="mt-4" />
          <LogoutButton className="mt-4" />
        </>
      )}
    </View>
  )
}

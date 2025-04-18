import { View, Text, Image } from "react-native"
import React from "react"
import Fontisto from "@expo/vector-icons/Fontisto"
import UploadImageBtn from "./UploadImageBtn"
import LogoutButton from "../LogoutButton"
import { useAuth } from "@/hooks/useAuth"

export default function UserImage() {
  const { user } = useAuth()

  return (
    <View className="flex-1 justify-center items-center">
      <View className="flex-row justify-center items-center gap-3 mb-4">
        {!user && (
          <Fontisto
            name="male"
            size={36}
            color="black"
            className="w-20 h-20 rounded-full border"
          />
        )}

        <Image
          source={{ uri: user?.profileImage }}
          className="w-20 h-20 rounded-full border"
        />

        <Text className="text-lg font-bold">
          {user?.name ? user.name : "No Name"}
        </Text>
      </View>

      {/* Upload Image Button */}
      <UploadImageBtn />

      {/* Logout Button */}
      <LogoutButton className="mt-4" />
    </View>
  )
}

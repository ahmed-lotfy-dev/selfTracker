import { View, Text, Button, TouchableOpacity } from "react-native"
import { useState } from "react"
import { Image } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useUpdate } from "@/hooks/useUpdate"
import { updateUser } from "@/utils/api/userApi"
import { useAuthActions, useUser } from "@/store/useAuthStore"
import { QueryClient } from "@tanstack/react-query"
import { UserType } from "@/types/userType"
import { deleteImage, uploadImage } from "@/utils/api/imageApi"
import { useAuth } from "@/hooks/useAuth"

export default function ProfileImage() {
  const { user, refetch } = useAuth()

  const [imageFile, setImageFile] = useState<string | null>(null)

  const { updateMutation } = useUpdate({
    mutationFn: updateUser,
  })

  const queryClient = new QueryClient()

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      })

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0]

        setImageFile(asset.uri)
        console.log({ imageFile })
      }
    } catch (error) {
      console.error("Error picking image:", error)
    }
  }

  const handleUpload = async () => {
    if (!imageFile || !user?.profileImage) return

    await deleteImage(user.profileImage)
    const { imageUrl } = await uploadImage(imageFile)
    console.log(imageUrl)
    updateMutation.mutate({
      id: user?.id,
      profileImage: imageUrl,
    })
    refetch()
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {imageFile && (
        <Image source={{ uri: imageFile }} className="w-32 h-32 rounded-full" />
      )}
      <TouchableOpacity onPress={handleUpload}>
        <Text className="p-4 bg-green-800 text-black font-bold rounded-lg mt-4">
          Upload
        </Text>
      </TouchableOpacity>
    </View>
  )
}

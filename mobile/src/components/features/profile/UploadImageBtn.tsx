import React from "react"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { deleteImage, uploadImage } from "@/src/lib/api/imageApi"
import { updateUser } from "@/src/lib/api/userApi"
import { View, Pressable } from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
import { useAuthActions } from "@/src/features/auth/useAuthStore"
import Foundation from "@expo/vector-icons/Foundation"

export default function UploadImageBtn({ className }: { className?: string }) {
  const { user } = useAuth()
  const { setUser } = useAuthActions()

  const pickImageAndUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      })

      if (result.canceled || !result.assets?.length) {
        return
      }

      const selectedImage = result.assets[0]

      const optimizedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 350 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      )

      if (user?.image) {
        await deleteImage(user.image)
      }

      const { imageUrl } = await uploadImage(
        optimizedImage,
        selectedImage.fileName ?? "profile.jpg",
        selectedImage.mimeType ?? "image/jpeg"
      )

      // Update User
      await updateUser({ id: user?.id!, image: imageUrl })
      setUser({ ...user, image: imageUrl })

    } catch (error) {
      console.error("Error during image selection or upload:", error)
    }
  }

  return (
    <View
      className={`flex-row justify-center items-center bg-gray-300  ${className}`}
    >
      <Pressable onPress={pickImageAndUpload}>
        <Foundation name="camera" size={30} color="lightslategray" />
      </Pressable>
    </View>
  )
}

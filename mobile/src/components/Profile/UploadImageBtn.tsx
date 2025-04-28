import { useAuth } from "@/src/hooks/useAuth"
import { deleteImage, uploadImage } from "@/src/utils/api/imageApi"
import { updateUser } from "@/src/utils/api/userApi"
import { useState } from "react"
import { View, Text, TouchableOpacity, Button } from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
import { useUpdate } from "@/src/hooks/useUpdate"
import { useAuthActions } from "@/src/store/useAuthStore"

export default function UploadImageBtn({ className }: { className?: string }) {
  const { user, refetch } = useAuth()
  const { setUser } = useAuthActions()
  const [imageFile, setImageFile] =
    useState<ImagePicker.ImagePickerAsset | null>(null)

  const { updateMutation } = useUpdate({
    mutationFn: updateUser,
    onSuccessInvalidate: [{ queryKey: ["userData"] }],
  })

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
        console.log("Image picker canceled or no image selected.")
        return
      }

      const selectedImage = result.assets[0]
      setImageFile(selectedImage)

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
        imageFile?.fileName ?? "",
        imageFile?.mimeType ?? ""
      )

      updateMutation.mutate(
        { id: user?.id, image: imageUrl },
        {
          onSuccess: () => {
            refetch()
            setUser({ ...user, image: imageUrl })
          },
        }
      )
    } catch (error) {
      console.error("Error during image selection or upload:", error)
    }
  }

  return (
    <View className={`flex-row justify-center items-center ${className}`}>
      <TouchableOpacity onPress={pickImageAndUpload}>
        <Text className="bg-gray-700 text-white px-4 py-2 rounded-lg">
          Change Picture
        </Text>
      </TouchableOpacity>
    </View>
  )
}

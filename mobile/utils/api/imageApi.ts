import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"
import { ImagePickerAsset } from "expo-image-picker"
import { ImageManipulatorContext, ImageResult } from "expo-image-manipulator"

export const uploadImage = async (
  image: ImageResult,
  fileName: string,
  imageType: string
) => {
  try {
    const formData = new FormData()

    // Check if the image has a base64 string
    const base64Image = image.base64
    if (!base64Image) {
      throw new Error("No Base64 data available for this image.")
    }

    const imageName = fileName ?? image.uri.split("/").pop() ?? "image.jpg"

    // Cloudinary expects base64 data in the format 'data:image/jpeg;base64,<base64Data>'
    const imageData = `data:${imageType};base64,${base64Image}`

    formData.append("image", imageData)

    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/image/upload`,
      formData
    )

    return response.data
  } catch (error) {
    console.error("Upload failed:", error)
    throw error
  }
}

export const deleteImage = async (imageLink: string) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/image/delete`,
    { imageLink }
  )
  return response.data
}

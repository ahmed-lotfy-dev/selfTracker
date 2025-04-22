import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_BASE_URL } from "./config"
import { ImagePickerAsset } from "expo-image-picker"
import { ImageManipulatorContext, ImageResult } from "expo-image-manipulator"

export const uploadImage = async (
  image: ImageResult,
  fileName: string,
  imageType: string
) => {
  try {
    const base64Image = image.base64
    if (!base64Image) {
      throw new Error("No Base64 data available for this image.")
    }

    const imageData = `data:${imageType};base64,${base64Image}`

    const response = await axios.post(`${API_BASE_URL}/api/image/upload`, {
      image: imageData,
    })
    return response.data
  } catch (error) {
    console.error("Upload failed:", error)
    return {
      success: false,
      message: error,
    }
  }
}

export const deleteImage = async (imageLink: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/image/delete`, {
    imageLink,
  })
  return response.data
}

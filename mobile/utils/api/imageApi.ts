import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"

export const uploadImage = async (image: string) => {
  console.log("Base64 Image:", image)
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/image/upload`,
    { image: image }
  )
  return response.data
}

export const deleteImage = async (imageLink: string) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/image/delete`,
    { imageLink }
  )
  return response.data
}

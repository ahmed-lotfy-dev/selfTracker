import { WeightType } from "@/src/types/weightType"
import { API_BASE_URL } from "./config"
import axios from "axios"

export const updateUser = async ({
  id,
  image,
}: {
  id: string
  image: string
}) => {
  const response = await axios.patch(`${API_BASE_URL}/api/users/${id}`, {
    image,
  })
  return response.data
}

export const deleteUser = async (weightId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/api/users/${weightId}`)
  return response.data
}

import { useQuery } from "@tanstack/react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { fetchUserData } from "@/utils/api/authApi"

export const useAuth = () => {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      try {
        const response = await fetchUserData()
        console.log("Fetched user data:", response)
        return response
      } catch (err) {
        console.error("Failed to fetch user data:", err)
        throw err
      }
    },
    refetchOnWindowFocus: false,
  })

  const clearAuth = async () => {
    await AsyncStorage.removeItem("accessToken")
    await AsyncStorage.removeItem("refreshToken")
  }

  return {
    user,
    isLoading,
    error,
    refetch,
    clearAuth,
  }
}

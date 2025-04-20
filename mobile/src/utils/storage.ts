import AsyncStorage from "@react-native-async-storage/async-storage"

export const getAccessToken = async () => {
  const token = await AsyncStorage.getItem("accessToken")
  return token
}

export const getRefreshToken = async () => {
  const token = await AsyncStorage.getItem("refreshToken")
  return token
}

export const setAccessToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem("accessToken", token)
}

export const setRefreshToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem("refreshToken", token)
}

export const clearTokens = async (): Promise<void> => {
  await AsyncStorage.removeItem("accessToken")
  await AsyncStorage.removeItem("refreshToken")
}

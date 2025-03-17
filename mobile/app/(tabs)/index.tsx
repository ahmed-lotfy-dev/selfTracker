import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Text, View, Button } from "tamagui"
import { getAllUsers, getToken, getUserData, setToken } from "@/utils/lib"
import axiosInstance from "@/utils/api"
import { useQuery } from "@tanstack/react-query"
import useAuthStore from "@/store/useAuthStore"

export default function HomeScreen() {
  const { user } = useAuthStore.getState()
  console.log(user)
  return (
    <View flex={1} justify="center" items="center" bg="gray">
      <Text fontSize={20} fontWeight="bold">
        Home
      </Text>
    </View>
  )
}

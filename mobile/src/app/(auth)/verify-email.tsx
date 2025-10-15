import React, { useState, useEffect } from "react"
import { View, Text,  } from "react-native"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import {
  checkEmailVerification,
  resendVerificationEmail,
} from "@/src/lib/api/authApi"
import { COLORS } from "@/src/constants/Colors"
import { useAuth } from "@/src/hooks/useAuth"

export default function VerifyEmail() {
  const router = useRouter()

  const { user, isAuthenticated, error, isLoading, refetch } = useAuth()

  useEffect(() => {
    if (user?.emailVerified) {
      router.replace("/")
    }
  }, [user])

  return (
    <View className="flex-1 justify-center items-center p-20 px-20">
      <Text className="text-md mb-20">
        Please check your email for a verification link.
      </Text>

      {isLoading && <Text>Checking verification status...</Text>}
      {error && <Text className="text-red-600">{error.message}</Text>}
    </View>
  )
}

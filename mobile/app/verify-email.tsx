import React, { useState } from "react"
import { View, Text, ActivityIndicator, Pressable } from "react-native"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import {
  checkEmailVerification,
  resendVerificationEmail,
} from "@/utils/api/authApi"

export default function VerifyEmail() {
  const router = useRouter()
  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  const { data, error, isLoading } = useQuery({
    queryKey: ["checkEmailVerification"],
    queryFn: checkEmailVerification,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  })

  React.useEffect(() => {
    if (data?.isVerified) {
      router.replace("/")
    }
  }, [data, router])

  const handleResendVerification = async () => {
    setResendStatus("loading")
    try {
      await resendVerificationEmail()
      setResendStatus("success")
    } catch (error) {
      setResendStatus("error")
    }
  }

  return (
    <View className="flex-1 justify-center items-center p-20 px-20">
      <Text className="text-md mb-20">
        Please check your email for a verification link.
      </Text>

      {resendStatus === "success" && (
        <Text className="text-green-500">
          Verification email resent successfully!
        </Text>
      )}
      {resendStatus === "error" && (
        <Text className="text-red-600">
          Failed to resend verification email. Please try again.
        </Text>
      )}

      <Pressable
        onPress={handleResendVerification}
        disabled={resendStatus === "loading"}
        className="mt-5 bg-blue-500 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {resendStatus === "loading" ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white">Resend Verification Email</Text>
        )}
      </Pressable>

      {isLoading && <Text>Checking verification status...</Text>}
      {error && (
        <Text className="text-red-600">
          Error checking verification status.
        </Text>
      )}
    </View>
  )
}

import React, { useState } from "react"
import { View, Text, Button, Spinner } from "tamagui"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import {
  checkEmailVerification,
  resendVerificationEmail,
} from "@/utils/api/auth"

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
    <View
      flex={1}
      justify="center"
      items="center"
      paddingBlock={20}
      paddingInline={20}
    >
      <Text fontSize={18} marginBlockEnd={20}>
        Please check your email for a verification link.
      </Text>

      {resendStatus === "success" && (
        <Text color="green">Verification email resent successfully!</Text>
      )}
      {resendStatus === "error" && (
        <Text color="red">
          Failed to resend verification email. Please try again.
        </Text>
      )}

      <Button
        onPress={handleResendVerification}
        disabled={resendStatus === "loading"}
        marginBlockStart={20}
      >
        {resendStatus === "loading" ? <Spinner /> : "Resend Verification Email"}
      </Button>

      {isLoading && <Text>Checking verification status...</Text>}
      {error && <Text color="red">Error checking verification status.</Text>}
    </View>
  )
}

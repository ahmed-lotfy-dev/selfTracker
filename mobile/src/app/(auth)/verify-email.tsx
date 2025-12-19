import React, { useState, useEffect } from "react"
import { View, Text, Pressable, Platform } from "react-native"
import { useRouter } from "expo-router"
import { resendVerificationEmail, verifyEmailOTP } from "@/src/lib/api/authApi"
import { COLORS } from "@/src/constants/Colors"
import { useAuth } from "@/src/hooks/useAuth"
import OTPInput from "@/src/components/ui/OTPInput"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"

export default function VerifyEmail() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  3
  const { user, isAuthenticated, error, isLoading, refetch } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user?.emailVerified) {
      requestAnimationFrame(() => router.replace("/"))
    }
  }, [isAuthenticated, user?.emailVerified])

  const handleVerifyOTP = async () => {
    setOtpError("")
    if (otp.length !== 6) {
      setOtpError("Please enter a complete 6-digit code")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await verifyEmailOTP(user?.email || "", otp)
      if (!response) {
        setOtpError("Invalid verification code")
      } else {
        // Refresh auth state to get updated user
        await refetch()
        requestAnimationFrame(() => router.replace("/home"))
      }
    } catch (err) {
      setOtpError("Invalid verification code")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    try {
      await resendVerificationEmail(user?.email)

      // You could add a toast/snackbar success message here
    } catch (err) {
      // Handle resend error
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text className="font-bold text-xl mb-4 text-center">
        Verify Your Email
      </Text>
      <Text className="text-md mb-8 text-center">
        We've sent a 6-digit code to your email. Enter it below to verify your
        account.
      </Text>
      <OTPInput length={6} onChange={setOtp} error={otpError} />
      <Pressable
        onPress={handleVerifyOTP}
        disabled={isSubmitting || otp.length !== 6}
        className={`p-4 rounded-md items-center mb-4 ${isSubmitting || otp.length !== 6 ? "bg-blue-200" : "bg-[#007bff]"
          }`}
      >
        {isSubmitting ? (
          <ActivitySpinner color={COLORS.primary} />
        ) : (
          <Text style={{ color: "white" }}>Verify Code</Text>
        )}
      </Pressable>
      <Pressable
        onPress={handleResendCode}
        className="justify-center items-center rounded-lg p-2"
      >
        <Text className="text-blue-500">Didn't receive the code? Resend</Text>
      </Pressable>
      {isLoading && (
        <Text className="mt-4">Checking verification status...</Text>
      )}
      {error && <Text className="text-red-600 mt-4">{error.message}</Text>}
    </KeyboardAvoidingView>
  )
}

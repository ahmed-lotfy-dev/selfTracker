import React, { useState } from "react"
import { View, Text, Pressable, Platform } from "react-native"
import { Redirect } from "expo-router"
import { resendVerificationEmail, verifyEmailOTP } from "@/src/lib/api/authApi"
import { COLORS } from "@/src/constants/Colors"
import { useAuth } from "@/src/features/auth/useAuthStore"
import OTPInput from "@/src/components/ui/OTPInput"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"

export default function VerifyEmail() {
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  // Redirect to home if email is verified
  if (isAuthenticated && user?.emailVerified) {
    return <Redirect href="/home" />
  }

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
      className="bg-background"
    >
      <Text className="font-bold text-xl mb-4 text-center text-text">
        Verify Your Email
      </Text>
      <Text className="text-md mb-8 text-center text-placeholder">
        We've sent a 6-digit code to your email. Enter it below to verify your
        account.
      </Text>
      <OTPInput length={6} onChange={setOtp} error={otpError} />
      <Pressable
        onPress={handleVerifyOTP}
        disabled={isSubmitting || otp.length !== 6}
        className={`p-4 rounded-md items-center mb-4 ${isSubmitting || otp.length !== 6 ? "bg-primary/50" : "bg-primary"
          }`}
      >
        {isSubmitting ? (
          <ActivitySpinner color={COLORS.primary} />
        ) : (
          <Text className="text-white font-semibold">Verify Code</Text>
        )}
      </Pressable>
      <Pressable
        onPress={handleResendCode}
        className="justify-center items-center rounded-lg p-2"
      >
        <Text className="text-primary font-medium">Didn't receive the code? Resend</Text>
      </Pressable>
      {isLoading && (
        <Text className="mt-4 text-placeholder">Checking verification status...</Text>
      )}
    </KeyboardAvoidingView>
  )
}

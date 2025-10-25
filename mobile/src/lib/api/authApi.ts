import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"
import { authClient } from "../auth-client"

export const signIn = async (email: string, password: string) => {
  const response = await authClient.signIn.email({ email, password })

  return response
}

export const signUp = async (name: string, email: string, password: string) => {
  const response = await authClient.signUp.email({
    name,
    email,
    password,
  })

  return response
}

export const signOut = async () => {
  const response = await authClient.signOut()
  return response
}

export const checkEmailVerification = async (userId: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/users/check-verification`,
    { id: userId }
  )
  return response
}

export const resendVerificationEmail = async (email: string, ) => {
  const { data, error } = await authClient.emailOtp.sendVerificationOtp({
    email, // required
    type: "email-verification", 
  })

  return data
}

export const verifyEmailOTP = async (email: string, otp: string) => {
  const { data, error } = await authClient.emailOtp.verifyEmail({
    email, // required
    otp, // required
  })
  return data
}

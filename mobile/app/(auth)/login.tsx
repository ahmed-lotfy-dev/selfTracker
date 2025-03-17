import axiosInstance, { BASE_URL } from "@/utils/api"
import { setToken } from "@/utils/lib"
import React, { useState } from "react"
import { Form, Input, Text, View, Button, Spinner } from "tamagui"
import { useRouter } from "expo-router"
import useAuthStore from "@/store/useAuthStore"
import axios from "axios"
import { UserType } from "@/types/userType"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"off" | "submitting" | "submitted">(
    "off"
  )
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async () => {
    setStatus("submitting")

    try {
      // Step 1: Login and get tokens
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      })

      const { accessToken, refreshToken } = response.data
      console.log({ accessToken, refreshToken })

      // Step 2: Store tokens in Zustand and AsyncStorage
      useAuthStore.getState().setTokens(accessToken, refreshToken)
      await setToken("accessToken", accessToken)
      await setToken("refreshToken", refreshToken)

      // Step 3: Fetch user data
      const { data: user } = await axios.get<UserType>(
        `${BASE_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      // Step 4: Store user data in Zustand
      useAuthStore.getState().setUser(user)

      // Step 5: Redirect to home
      setStatus("submitted")
      router.replace("/")
    } catch (error: any) {
      console.error("Login failed:", error)
      setErrorMessage(error.response?.data?.message || "Login failed")
      setStatus("off")
    }
  }

  return (
    <View height={"100%"} flex={1} justify={"space-between"} items={"center"}>
      <Text paddingBlockStart={30}>Login Form</Text>
      <Form flex={1} paddingBlockStart={30} onSubmit={handleLogin}>
        <Text>Email</Text>
        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <Text>Password</Text>
        <Input
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        {errorMessage ? <Text color="red">{errorMessage}</Text> : null}

        <Form.Trigger asChild>
          <Button
            icon={status === "submitting" ? () => <Spinner /> : undefined}
            disabled={status === "submitting"}
          >
            Login
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  )
}

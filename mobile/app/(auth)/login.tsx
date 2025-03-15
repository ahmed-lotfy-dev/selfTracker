import axiosInstance from "@/utils/api"
import { setTokens } from "@/utils/lib"
import React, { useState } from "react"
import { Form, Input, Text, View, Button, Spinner } from "tamagui"

export default function Login({}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    setStatus("submitting")

    try {
      const res = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      })
      console.log(res.data)
      setStatus("submitted")
      setTokens(res.data.tokens)
      window.location.href = "/"
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message)
      setStatus("off")
    }
  }
  const [status, setStatus] = React.useState<
    "off" | "submitting" | "submitted"
  >("off")

  React.useEffect(() => {
    if (status === "submitting") {
      const timer = setTimeout(() => setStatus("off"), 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [status])

  return (
    <View height={"100%"} flex={1} justify={"space-between"} items={"center"}>
      <Text paddingBlockStart={30}>Login Form</Text>
      <Form flex={1} paddingBlockStart={30} onSubmit={handleLogin}>
        <Text>Email</Text>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <Text>Password</Text>
        <Input
          placeholder="Password"
          passwordRules={"true"}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <Form.Trigger asChild>
          <Button
            icon={status === "submitting" ? () => <Spinner /> : undefined}
          >
            Login
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  )
}

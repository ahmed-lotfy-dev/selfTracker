import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native"
import { Link, useRouter } from "expo-router"
import { showAlert } from "@/utils/lib"
import { useForm } from "@tanstack/react-form"
import { COLORS } from "@/constants/Colors"
import { setAccessToken } from "@/utils/storage"
import { useAuthActions } from "@/store/useAuthStore"
import { authClient } from "@/utils/auth-client"
import { signUp } from "@/utils/api/authApi"

export default function SignUp() {
  const router = useRouter()
  const { setUser } = useAuthActions()

  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      const response = await signUp(value.name, value.email, value.password)
      console.log({ response })
      if (response.error) {
        setErrorMessage(response.error.message || "")
      }
      if (response.data) {
        setUser(response.data.token)
        router.replace("/(auth)/verify-email")
      }
    },
  })

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text className="font-bold text-xl mb-4">Sign Up</Text>

      <form.Field
        name="name"
        children={(field) => (
          <TextInput
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            placeholder="Name"
            autoCapitalize="none"
            autoComplete="name"
            className="border border-gray-300 rounded-md px-4 py-2 mb-3"
          />
        )}
      />
      <form.Field
        name="email"
        children={(field) => (
          <TextInput
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            className="border border-gray-300 rounded-md px-4 py-2 mb-3"
          />
        )}
      />
      <form.Field
        name="password"
        children={(field) => (
          <TextInput
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            placeholder="Password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            className="border border-gray-300 rounded-md px-4 py-2 mb-3"
          />
        )}
      />
      {errorMessage ? (
        <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text>
      ) : null}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <TouchableOpacity
            onPress={() => form.handleSubmit()}
            // disabled={!canSubmit || isSubmitting}
            className="bg-[#007bff] p-4 rounded-md items-center font-bold text-xl"
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={{ color: "white" }}>Sign Up</Text>
            )}
          </TouchableOpacity>
        )}
      />
      <Link href="/sign-in" asChild>
        <Pressable className="justify-center items-center  rounded-lg p-2 mr-5 mt-4">
          <Text className="text-blue-500 font-bold">
            Already have an account? Sign In
          </Text>
        </Pressable>
      </Link>
    </KeyboardAvoidingView>
  )
}

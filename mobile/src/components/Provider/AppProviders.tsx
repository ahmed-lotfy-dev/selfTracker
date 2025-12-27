import React, { ReactNode } from "react"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { LoadingIndicator, LoadingOverlay } from "../ui/Loading"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/src/lib/react-query"
import { ToastProvider } from "@/src/hooks/useToast"
import { useAuth, useHasHydrated } from "@/src/features/auth/useAuthStore"

export { queryClient }

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const { isLoading } = useAuth()
  const hasHydrated = useHasHydrated()

  if (!hasHydrated) {
    return (
      <SafeAreaProvider>
        <LoadingIndicator message="Initializing..." />
      </SafeAreaProvider>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingIndicator message="Preparing Experience..." />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <KeyboardProvider>
              <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
                {isLoading && <LoadingOverlay />}
                {children}
              </SafeAreaView>
            </KeyboardProvider>
          </ToastProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

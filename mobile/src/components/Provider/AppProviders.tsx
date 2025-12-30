import React, { ReactNode } from "react"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { BrandedLoadingScreen, LoadingOverlay } from "../ui/Loading"

import { ToastProvider } from "@/src/hooks/useToast"
import { useAuth, useHasHydrated } from "@/src/features/auth/useAuthStore"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const { isLoading } = useAuth()
  const hasHydrated = useHasHydrated()

  // Show branded loading during auth hydration
  if (!hasHydrated) {
    return (
      <SafeAreaProvider>
        <BrandedLoadingScreen message="Initializing..." />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <KeyboardProvider>
            <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
              {isLoading && <LoadingOverlay />}
              {children}
            </SafeAreaView>
          </KeyboardProvider>
        </ToastProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

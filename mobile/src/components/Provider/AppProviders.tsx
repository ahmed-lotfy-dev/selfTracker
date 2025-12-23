import React, { ReactNode, useMemo, useState, useEffect } from "react"
import { Text, ActivityIndicator, View, unstable_batchedUpdates as batchUpdates, StyleSheet } from "react-native"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { LoadingIndicator, LoadingOverlay } from "../ui/Loading"
import { SyncErrorView } from "../ui/SyncErrorView"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/src/lib/react-query"
import { ToastProvider } from "@/src/hooks/useToast"
import { useAuth, useHasHydrated } from "@/src/features/auth/useAuthStore"
import { CollectionsProvider } from "./CollectionsProvider"

export { queryClient }

interface AppProvidersProps {
  children: ReactNode
}

const syncUrl = process.env.EXPO_PUBLIC_LIVESTORE_SYNC_URL

export function AppProviders({ children }: AppProvidersProps) {
  const { storeId, isLoading } = useAuth()
  const hasHydrated = useHasHydrated()


  // 1. Storage Hydration
  if (!hasHydrated) {
    return (
      <SafeAreaProvider>
        <LoadingIndicator message="Initializing..." />
      </SafeAreaProvider>
    )
  }

  // 2. Auth Stabilization
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
              <CollectionsProvider>
                <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
                  {isLoading && <LoadingOverlay />}
                  {children}
                </SafeAreaView>
              </CollectionsProvider>
            </KeyboardProvider>
          </ToastProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

const LoadingOverlayComponent = () => <LoadingOverlay />

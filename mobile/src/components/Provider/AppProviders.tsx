import React, { ReactNode, useMemo, useState, useEffect } from "react"
import { Text, ActivityIndicator, View, unstable_batchedUpdates as batchUpdates, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { LoadingIndicator, LoadingOverlay } from "../ui/Loading"
import { SyncErrorView } from "../ui/SyncErrorView"

import { QueryClientProvider } from "@tanstack/react-query"
import { makePersistedAdapter } from '@livestore/adapter-expo'
import { LiveStoreProvider } from '@livestore/react'
import { makeWsSync } from '@livestore/sync-cf/client'

import { queryClient } from "@/src/lib/react-query"
import { ToastProvider } from "@/src/hooks/useToast"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { useHasHydrated } from "@/src/features/auth/useAuthStore";
import { schema } from '@/src/livestore/schema'

export { queryClient }

interface AppProvidersProps {
  children: ReactNode
}

const syncUrl = process.env.EXPO_PUBLIC_LIVESTORE_SYNC_URL

export function AppProviders({ children }: AppProvidersProps) {
  const { storeId, token, isLoading } = useAuth()
  const hasHydrated = useHasHydrated()
  const [isRepairMode, setRepairMode] = useState(false)

  // 1. Storage Hydration
  if (!hasHydrated) return <LoadingIndicator message="Initializing..." />

  // 2. Auth Stabilization (Prevent flickering)
  // We wait for auth to settle so we don't start a sync session before we know who the user is
  if (isLoading) return <LoadingIndicator message="Preparing Experience..." />

  const finalStoreId = storeId ?? 'anonymous'

  // Only attempt sync if we have a token (since our backend is strict)
  // If no token, we just don't pass a backend to the adapter
  const authenticatedUrl = (token && syncUrl) ? `${syncUrl}?token=${token}` : undefined

  useEffect(() => {
    if (authenticatedUrl) {
      console.log(`[LiveStore] Sync initialized with URL: ${authenticatedUrl.split('?')[0]}?token=${token?.substring(0, 5)}...`)
    } else {
      console.log("[LiveStore] Sync disabled (no token or syncUrl)")
    }
  }, [authenticatedUrl, token])

  const adapter = useMemo(() => {
    if (isRepairMode) console.log("[LiveStore] Initializing adapter in REPAIR MODE (resetPersistence: true)")

    return makePersistedAdapter({
      sync: { backend: authenticatedUrl ? makeWsSync({ url: authenticatedUrl }) : undefined },
      resetPersistence: isRepairMode,
    })
  }, [isRepairMode, authenticatedUrl])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <LiveStoreProvider
            // Remount completely if store changes or if we need to repair (wipe) the DB
            key={`${finalStoreId}-${isRepairMode}`}
            schema={schema}
            adapter={adapter}
            storeId={finalStoreId}
            syncPayload={{ authToken: token ?? '' }}
            batchUpdates={batchUpdates}
            renderLoading={(stage) => {
              console.log(`[LiveStore] Stage: ${stage.stage}...`)
              return <LoadingIndicator message={`LiveStore: ${stage.stage}...`} />
            }}
            renderError={(error) => {
              console.error(`[LiveStore] Sync Error:`, error)
              return (
                <SyncErrorView
                  error={error}
                  isRepairing={isRepairMode}
                  onRepair={() => setRepairMode(true)}
                />
              )
            }}
          >
            <KeyboardProvider>
              <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
                {isLoading && <LoadingOverlay />}
                {children}
              </SafeAreaView>
            </KeyboardProvider>
          </LiveStoreProvider>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

const LoadingOverlayComponent = () => <LoadingOverlay />

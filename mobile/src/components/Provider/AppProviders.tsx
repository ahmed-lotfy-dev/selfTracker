import React, { ReactNode, useMemo, useState, useEffect } from "react"
import { Text, ActivityIndicator, View, unstable_batchedUpdates as batchUpdates, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { Feather } from "@expo/vector-icons"

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

  const adapter = useMemo(() => {
    // Only log essential lifecycle events
    if (isRepairMode) console.log("[LiveStore] Initializing adapter in REPAIR MODE (resetPersistence: true)")

    // Pass token in Query String for Middleware Auth on Backend
    const authenticatedUrl = token && syncUrl ? `${syncUrl}?token=${token}` : syncUrl

    return makePersistedAdapter({
      sync: { backend: authenticatedUrl ? makeWsSync({ url: authenticatedUrl }) : undefined },
      resetPersistence: isRepairMode,
    })
  }, [isRepairMode, token])

  // 1. Storage Hydration
  if (!hasHydrated) return <LoadingView message="Initializing..." />

  const finalStoreId = storeId ?? 'anonymous'

  // 2. Auth Stabilization (Prevent flickering)
  // We wait for auth to settle so we don't start an anonymous session just to switch immediately
  if (isLoading && finalStoreId === 'anonymous') return <LoadingView message="Preparing Experience..." />

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
            renderLoading={(stage) => <LoadingView message={`LiveStore: ${stage.stage}...`} />}
            renderError={(error) => (
              <ErrorView
                error={error}
                isRepairing={isRepairMode}
                onRepair={() => setRepairMode(true)}
              />
            )}
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

// --- Internal Components for Cleanliness ---

const LoadingView = ({ message }: { message: string }) => (
  <SafeAreaView style={styles.center}>
    <ActivityIndicator size="large" color="#10B981" />
    <Text style={styles.text}>{message}</Text>
  </SafeAreaView>
)

const LoadingOverlay = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="small" color="#10B981" />
  </View>
)

const ErrorView = ({ error, isRepairing, onRepair }: { error: any, isRepairing: boolean, onRepair: () => void }) => {
  const msg = (error?.message || error?.toString() || 'Unknown Error');
  // Detect specific corruption errors from expo-sqlite
  const isCorruption = msg.includes('sqlite_master') || msg.includes('NullPointerException') || msg.includes('preparing statement');

  // Auto-trigger repair only for clear corruption cases
  useEffect(() => {
    if (isCorruption && !isRepairing) {
      console.log("[LiveStore] Database corruption detected. Auto-repairing...")
      const timer = setTimeout(onRepair, 0);
      return () => clearTimeout(timer);
    }
  }, [isCorruption, isRepairing, onRepair]);

  if (isRepairing) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={[styles.text, { color: '#D97706', fontWeight: 'bold' }]}>Repairing Database...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.center, { padding: 20 }]}>
      <Feather name="alert-triangle" size={48} color="#EF4444" />
      <Text style={styles.title}>Sync Error</Text>
      <Text style={[styles.text, { textAlign: 'center' }]}>{msg}</Text>

      {/* Show manual button if it's not a generic corruption we already caught, or if auto-repair somehow failed/didn't trigger */}
      <Text onPress={onRepair} style={styles.button}>
        Reset & Repair Database
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 12, color: '#6B7280' },
  title: { marginTop: 16, fontSize: 18, fontWeight: 'bold' },
  button: { marginTop: 20, color: '#fff', backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, overflow: 'hidden' }
})

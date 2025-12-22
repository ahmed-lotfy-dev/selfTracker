import { ReactNode, useMemo } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { Text, ActivityIndicator, unstable_batchedUpdates as batchUpdates } from "react-native"
import { Feather } from "@expo/vector-icons"
import { ToastProvider } from "@/src/hooks/useToast"
import { useAuth } from "@/src/hooks/useAuth"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { queryClient } from "@/src/lib/react-query"

import { makePersistedAdapter } from '@livestore/adapter-expo'
import { LiveStoreProvider } from '@livestore/react'
import { makeWsSync } from '@livestore/sync-cf/client'
import { schema } from '@/src/livestore/schema'

interface AppProvidersProps {
  children: ReactNode
}

export { queryClient }

const syncUrl = process.env.EXPO_PUBLIC_LIVESTORE_SYNC_URL

export function AppProviders({ children }: AppProvidersProps) {
  // Theme logic is now inside the hook
  const { storeId, token, isLoading } = useAuth()

  const adapter = useMemo(() => {
    return makePersistedAdapter({
      sync: { backend: syncUrl ? makeWsSync({ url: syncUrl }) : undefined },
    })
  }, [storeId, token])

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Preparing Experience...</Text>
      </SafeAreaView>
    )
  }

  const finalStoreId = storeId ?? 'anonymous'

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <LiveStoreProvider
            key={`${finalStoreId}-${token ? 'auth' : 'noauth'}`}
            schema={schema}
            adapter={adapter}
            storeId={finalStoreId}
            syncPayload={{ authToken: token ?? '' }}
            renderLoading={(stage) => (
              <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>LiveStore: {stage.stage}...</Text>
              </SafeAreaView>
            )}
            renderError={(error: any) => {
              console.error("[LiveStore] Error:", error)
              return (
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                  <Feather name="alert-triangle" size={48} color="#EF4444" />
                  <Text style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>Sync Error</Text>
                  <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>{error.message || error.toString()}</Text>
                </SafeAreaView>
              )
            }}
            batchUpdates={batchUpdates}
          >
            <KeyboardProvider>
              <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
                {children}
              </SafeAreaView>
            </KeyboardProvider>
          </LiveStoreProvider>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}


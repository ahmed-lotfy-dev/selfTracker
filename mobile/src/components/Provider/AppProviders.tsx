import { ReactNode, useEffect, useState, useMemo } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { useColorScheme, View, Text, Button, ActivityIndicator, unstable_batchedUpdates as batchUpdates } from "react-native"
import { Feather } from "@expo/vector-icons"
import { ToastProvider } from "@/src/hooks/useToast"
import { useUser, useHasHydrated } from "@/src/store/useAuthStore"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Uniwind } from 'uniwind'
import { queryClient } from "@/src/lib/react-query"
import { getAccessToken, secureStorage } from "@/src/lib/storage"
import { authClient } from "@/src/lib/auth-client"

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
  const hasHydrated = useHasHydrated()
  const [session, setSession] = useState<any>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  useEffect(() => {
    if (hasHydrated) {
      console.log("[Auth] Zustand hydrated. Validating session...")
      authClient.getSession()
        .then(({ data }) => {
          console.log("[Auth] Session check complete:", data ? `User ${data.user.id}` : "NO SESSION")
          setSession(data)
        })
        .catch(err => console.error("[Auth] getSession Exception:", err))
        .finally(() => setIsSessionLoading(false))
    }
  }, [hasHydrated])

  useEffect(() => {
    const desiredTheme = session?.user?.theme ?? 'system'
    Uniwind.setTheme(desiredTheme)
  }, [session?.user?.theme])

  const storeId = session?.user?.id
  const authToken = session?.session?.token

  const adapter = useMemo(() => {
    const finalStoreId = storeId ?? 'anonymous'
    console.log(`[LiveStore] Creating adapter for store: ${finalStoreId}`)
    return makePersistedAdapter({
      sync: { backend: syncUrl ? makeWsSync({ url: syncUrl }) : undefined },
    })
  }, [storeId])

  const isLoading = !hasHydrated || isSessionLoading

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
            key={finalStoreId}
            schema={schema}
            adapter={adapter}
            storeId={finalStoreId}
            syncPayload={{ authToken: authToken ?? '' }}
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


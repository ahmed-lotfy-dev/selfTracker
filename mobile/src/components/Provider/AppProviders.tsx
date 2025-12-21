import { ReactNode, useEffect, useState, useMemo } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { useColorScheme, View, Text, Button, ActivityIndicator, unstable_batchedUpdates as batchUpdates } from "react-native"
import { Feather } from "@expo/vector-icons"
import { ToastProvider } from "@/src/hooks/useToast"
import { useUser } from "@/src/store/useAuthStore"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Uniwind } from 'uniwind'
import { queryClient } from "@/src/lib/react-query"
import { getAccessToken } from "@/src/lib/storage"

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
  const systemScheme = useColorScheme()
  const user = useUser()
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    const desiredTheme = user?.theme ?? 'system'
    Uniwind.setTheme(desiredTheme)
  }, [user?.theme])

  useEffect(() => {
    getAccessToken().then((token: string | null) => setAuthToken(token))
  }, [user?.id])

  const storeId = user?.id ?? 'anonymous'

  const adapter = useMemo(() => {
    console.log(`[LiveStore] initializing adapter for store: ${storeId}`)
    return makePersistedAdapter({
      sync: { backend: syncUrl ? makeWsSync({ url: syncUrl }) : undefined },
    })
  }, [storeId]) // Re-init adapter only when store identity changes

  const activeTheme = (user?.theme === 'system' || !user?.theme)
    ? (systemScheme ?? 'light')
    : user?.theme

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <LiveStoreProvider
            schema={schema}
            adapter={adapter}
            storeId={storeId}
            syncPayload={{ authToken: authToken ?? '' }}
            renderLoading={(stage) => (
              <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Initializing LiveStore ({stage.stage})...</Text>
              </SafeAreaView>
            )}
            renderError={(error: any) => {
              console.error("[LiveStore] Critical Error:", error)
              return (
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                  <Feather name="alert-triangle" size={48} color="#EF4444" />
                  <Text style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Sync Error</Text>
                  <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>
                    {error.message || error.toString()}
                  </Text>
                  <View style={{ marginTop: 24 }}>
                    <Button title="Retry Initial Sync" onPress={() => { /* Reloading would be better */ }} />
                  </View>
                </SafeAreaView>
              )
            }}
            renderShutdown={() => (
              <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>LiveStore Shutdown</Text>
              </SafeAreaView>
            )}
            batchUpdates={batchUpdates}
          >
            <KeyboardProvider>
              <SafeAreaView
                edges={["top", "left", "right"]}
                style={{ flex: 1 }}
              >
                {children}
              </SafeAreaView>
            </KeyboardProvider>
          </LiveStoreProvider>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

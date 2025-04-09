import { ReactNode, useMemo, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SafeAreaView } from "react-native-safe-area-context"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 2 } } })
  )

  return (
    <QueryClientProvider client={queryClient}>
        <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </QueryClientProvider>
  )
}

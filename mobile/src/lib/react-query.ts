import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5,    // 5 minutes
      networkMode: "offlineFirst",
      retry: false,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: false,
    },
  },
})

import React from "react"
import { useToastStore } from "@/src/store/useToastStore"

export const useToast = () => {
  const { showToast, hideToast } = useToastStore()
  return { showToast, hideToast }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  // Toast is handled globally by AppProviders rendering <Toast />
  // This provider is kept for compatibility if needed, but does nothing now
  return <>{children}</>
}

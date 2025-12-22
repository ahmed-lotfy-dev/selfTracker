import React from "react"
import { useToastStore } from "@/src/features/ui/useToastStore"

export const useToast = () => {
  const { showToast, hideToast } = useToastStore()
  return { showToast, hideToast }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import React, { useState, createContext, useContext, useEffect, useRef } from "react"
import Toast from "@/src/components/ui/Toast"

type ToastMessage = {
  message: string
  type: "success" | "error"
}

type ToastContextType = {
  showToast: (message: string, type: "success" | "error") => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </ToastContext.Provider>
  )
}

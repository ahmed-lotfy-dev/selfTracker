import { authClient } from "@/lib/auth-client"
import { ReactNode } from "react"
import { Navigate } from "@tanstack/react-router"

// Better Auth uses a hook for session
// But we are outside a component in loader? No, this is a wrapper component.

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    // TanStack Router navigate
    // But better to return Navigate component if available or redirect
    // TanStack Router's <Navigate> is for this.
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      })
      if (error) {
        toast.error(error.message || "Login failed")
      } else {
        toast.success("Login successful")
        window.location.href = "/"
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email and password to access your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/* <Link to="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                  Forgot password?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative w-full text-center text-xs text-muted-foreground py-2">
              <span className="bg-background px-2 relative z-10">Or continue with</span>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted"></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="outline"
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { open } = await import("@tauri-apps/plugin-shell");
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
                    await open(`${backendUrl}/api/auth/sign-in/social?provider=google&callbackURL=selftracker://auth`);
                  } catch (err) {
                    console.error("Failed to open system browser", err);
                    setError("Failed to open browser");
                    setLoading(false);
                  }
                }}
                className="w-full gap-2"
              >
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { open } = await import("@tauri-apps/plugin-shell");
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
                    await open(`${backendUrl}/api/auth/sign-in/social?provider=github&callbackURL=selftracker://auth`);
                  } catch (err) {
                    console.error("Failed to open system browser", err);
                    setError("Failed to open browser");
                    setLoading(false);
                  }
                }}
                className="w-full gap-2"
              >
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm mt-2">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="underline">
                Register
              </Link>
            </div>
          </CardFooter>
          {error && (
            <div className="px-6 pb-4 text-center text-sm text-red-500">
              {error}
            </div>
          )}
        </form>
      </Card>
    </div >
  )
}

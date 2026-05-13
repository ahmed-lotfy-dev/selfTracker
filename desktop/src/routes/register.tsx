import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { waitForDeepLink } from "@/lib/external-auth"
import axiosInstance from "@/lib/api/axiosInstance"
const Github = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)
export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      })
      if (error) {
        toast.error(error.message || "Registration failed")
      } else {
        if (data?.user?.id) {
          localStorage.setItem("user_id", data.user.id);
        }
        toast.success("Registration successful")
        navigate({ to: "/" })
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
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Create a new account to start tracking your self.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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
              {loading ? "Creating account..." : "Sign Up"}
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
                      const backendUrl = axiosInstance.defaults.baseURL || "https://selftracker.ahmedlotfy.site";
                      const callbackURL = `${backendUrl}/api/desktop-success`;
                      const { open } = await import("@tauri-apps/plugin-shell");
                      await open(`${backendUrl}/api/auth/desktop/google?callbackURL=${encodeURIComponent(callbackURL)}`);
                      const authResult = await waitForDeepLink();
                      if (authResult?.token) {
                        localStorage.setItem("bearer_token", authResult.token);
                        try {
                          const session = await authClient.getSession();
                          if (session.data?.user?.id) localStorage.setItem("user_id", session.data.user.id);
                        } catch (e) { console.error("Failed session fetch", e); }
                        toast.success("Registration successful");
                        window.location.href = "/";
                      }
                    } catch (err: any) {
                      console.error("Google signup error:", err);
                      const errorMsg = err?.message || err?.toString() || "Unknown error";
                      setError(`Google signup failed: ${errorMsg}`);
                      toast.error(`Google signup failed: ${errorMsg}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full gap-2"
                >
                  <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const backendUrl = axiosInstance.defaults.baseURL || "https://selftracker.ahmedlotfy.site";
                      const callbackURL = `${backendUrl}/api/desktop-success`;
                      const { open } = await import("@tauri-apps/plugin-shell");
                      await open(`${backendUrl}/api/auth/desktop/github?callbackURL=${encodeURIComponent(callbackURL)}`);
                      const authResult = await waitForDeepLink();
                      if (authResult?.token) {
                        localStorage.setItem("bearer_token", authResult.token);
                        try {
                          const session = await authClient.getSession();
                          if (session.data?.user?.id) localStorage.setItem("user_id", session.data.user.id);
                        } catch (e) { console.error("Failed session fetch", e); }
                        toast.success("Registration successful");
                        window.location.href = "/";
                      }
                    } catch (err: any) {
                      console.error("GitHub signup error:", err);
                      const errorMsg = err?.message || err?.toString() || "Unknown error";
                      setError(`GitHub signup failed: ${errorMsg}`);
                      toast.error(`GitHub signup failed: ${errorMsg}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
            </div>

            <div className="pt-2 w-full">
              <Button variant="ghost" type="button" onClick={() => window.location.href = "/"} className="w-full text-muted-foreground hover:text-primary">
                Later (Continue as Guest)
              </Button>
            </div>

            <div className="text-center text-sm mt-2">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Login
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
    </div>
  )
}

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Github } from "lucide-react"

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
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      })
      if (error) {
        toast.error(error.message || "Registration failed")
      } else {
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
                  setError("");
                  try {
                    const { open } = await import("@tauri-apps/plugin-shell");
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

                    const response = await fetch(`${backendUrl}/api/auth/sign-in/social`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        provider: "google",
                        callbackURL: `${backendUrl}/api/social-success?platform=desktop`,
                      }),
                    });

                    const data = await response.json();
                    if (data?.url) {
                      await open(data.url);
                    } else {
                      throw new Error(data?.message || "Failed to get auth URL");
                    }
                  } catch (err: any) {
                    console.error("Failed to open system browser", err);
                    setError(err.message || "Failed to open browser");
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
                  setError("");
                  try {
                    const { open } = await import("@tauri-apps/plugin-shell");
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

                    const response = await fetch(`${backendUrl}/api/auth/sign-in/social`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        provider: "github",
                        callbackURL: `${backendUrl}/api/social-success?platform=desktop`,
                      }),
                    });

                    const data = await response.json();
                    if (data?.url) {
                      await open(data.url);
                    } else {
                      throw new Error(data?.message || "Failed to get auth URL");
                    }
                  } catch (err: any) {
                    console.error("Failed to open system browser", err);
                    setError(err.message || "Failed to open browser");
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

            <div className="text-center text-sm">
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

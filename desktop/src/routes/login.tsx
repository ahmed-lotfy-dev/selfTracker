import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Github } from "lucide-react"
import { waitForDeepLink } from "@/lib/external-auth"
import { open } from "@tauri-apps/plugin-shell"
import { API_BASE_URL } from "@/lib/api"

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
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "An unexpected error occurred");
      setError(err.message || "An unexpected error occurred");
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
                    const result = await authClient.signIn.social({
                      provider: "google",
                      callbackURL: `${API_BASE_URL}/api/desktop-success`,
                      // @ts-ignore - MUST BE disableRedirect TO PREVENT IN-APP OPEN
                      disableRedirect: true
                    });

                    if (result.data?.url) {
                      console.log("[Login] Opening Google OAuth in system browser:", result.data.url);
                      await open(result.data.url);

                      const authResult = await waitForDeepLink();

                      if (authResult?.token) {
                        localStorage.setItem("bearer_token", authResult.token);
                        toast.success("Login successful");
                        window.location.href = "/";
                      }
                    }
                  } catch (err: any) {
                    console.error("Google login error:", err);
                    const errorMsg = err?.message || err?.toString() || "Unknown error";
                    setError(`Google login failed: ${errorMsg}`);
                    toast.error(`Google login failed: ${errorMsg}`);
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
                    const result = await authClient.signIn.social({
                      provider: "github",
                      callbackURL: `${API_BASE_URL}/api/desktop-success`,
                      // @ts-ignore - MUST BE disableRedirect TO PREVENT IN-APP OPEN
                      disableRedirect: true
                    });

                    if (result.data?.url) {
                      console.log("[Login] Opening GitHub OAuth in system browser:", result.data.url);
                      await open(result.data.url);

                      const authResult = await waitForDeepLink();

                      if (authResult?.token) {
                        localStorage.setItem("bearer_token", authResult.token);
                        toast.success("Login successful");
                        window.location.href = "/";
                      }
                    }
                  } catch (err: any) {
                    console.error("GitHub login error:", err);
                    const errorMsg = err?.message || err?.toString() || "Unknown error";
                    setError(`GitHub login failed: ${errorMsg}`);
                    toast.error(`GitHub login failed: ${errorMsg}`);
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
    </div>
  )
}

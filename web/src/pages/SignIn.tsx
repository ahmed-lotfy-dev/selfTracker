import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authClient } from "../lib/auth-client"
import { useAuthStore } from "../stores/authStore"
import { Activity } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const loginWithToken = useAuthStore((s) => s.loginWithToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data, error: authErr } = await authClient.signIn.email({ email, password })
      if (authErr) { setError(authErr.message || "Invalid credentials"); return }
      if (data?.token) await loginWithToken(data.token)
      navigate("/")
    } catch {
      setError("Connection error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06060a] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Activity className="text-brand-blue mx-auto" size={32} />
          <h1 className="text-2xl font-bold text-white mt-3">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your SelfTracker</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <p className="text-sm text-brand-red bg-brand-red/10 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-blue/50" placeholder="ahmed@example.com" required />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-blue/50" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-blue rounded-xl font-medium text-sm hover:bg-brand-blue/80 transition-colors disabled:opacity-40">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-xs text-gray-600 text-center">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/sign-up")} className="text-brand-blue hover:underline">Sign up</button>
          </p>
        </form>
      </div>
    </div>
  )
}

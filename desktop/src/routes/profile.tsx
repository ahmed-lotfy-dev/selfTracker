import { useState, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { updateUser } from "@/services/api/user"
import axiosInstance from "@/lib/api/axiosInstance"

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface UserData {
  id: string
  name: string
  email: string
  image?: string
  gender?: string
  weight?: number
  height?: number
  unitSystem?: string
  theme?: string
  currency?: string
  income?: number
  dateOfBirth?: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  const [name, setName] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [gender, setGender] = useState("male")
  const [unitSystem, setUnitSystem] = useState("metric")
  const [theme, setTheme] = useState("system")
  const [currency, setCurrency] = useState("EGP")
  const [income, setIncome] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authClient.getSession()
        const user = session?.data?.user
        if (user) {
          const data = {
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            image: user.image || "",
          }
          setUserData(data as UserData)
          setName(data.name)
          setAvatarUrl(data.image || "")
        }
      } catch (e) {
        console.error("Failed to fetch user", e)
      }
    }
    fetchUser()
  }, [])

  const handleImagePick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await toBase64(file)
      const res = await axiosInstance.post<{ imageLink: string }>("/api/image/upload", { image: base64 })
      setAvatarUrl(res.data.imageLink)
    } catch (err) {
      console.error("Image upload failed", err)
    }
  }

  const handleSave = async () => {
    if (!userData?.id) return
    setIsPending(true)
    try {
      const payload: Record<string, any> = { id: userData.id, name, gender, unitSystem, currency, theme }
      if (weight) payload.weight = parseFloat(weight)
      if (height) payload.height = parseFloat(height)
      if (income) payload.income = parseFloat(income)
      if (dateOfBirth) payload.dateOfBirth = dateOfBirth
      if (avatarUrl) payload.image = avatarUrl
      await updateUser(payload)
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsPending(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut()
    } catch {}
    localStorage.removeItem("bearer_token")
    navigate({ to: "/login" })
  }

  const initial = name?.charAt(0).toUpperCase() || "U"

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 pb-20">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Profile Hero */}
      <div className="rounded-2xl border bg-card pt-10 pb-10 text-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <button onClick={handleImagePick} className="relative mb-6 group">
            <div className="w-40 h-40 rounded-full flex items-center justify-center border-4 border-border bg-accent mx-auto overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-6xl font-black text-muted-foreground/20">{initial}</span>
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-background p-3 rounded-full border-4 border-card shadow-lg group-hover:scale-110 transition-transform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </button>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="text-center text-4xl font-black bg-transparent border-none outline-none w-full max-w-md tracking-tighter"
            placeholder="User Name" />
          <div className="bg-accent px-4 py-1.5 rounded-full border border-border mt-1">
            <span className="text-muted-foreground/60 text-xs font-black uppercase tracking-widest">{userData?.email}</span>
          </div>
        </div>
      </div>

      {/* Physical Stats */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Physical Stats</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Weight</span>
            <div className="flex items-center gap-2">
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                className="w-24 text-right bg-accent border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" placeholder="0" />
              <span className="text-xs text-muted-foreground">{unitSystem === "imperial" ? "lbs" : "kg"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Height</span>
            <div className="flex items-center gap-2">
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                className="w-24 text-right bg-accent border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" placeholder="0" />
              <span className="text-xs text-muted-foreground">{unitSystem === "imperial" ? "in" : "cm"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Gender</span>
            <div className="flex bg-accent rounded-lg p-1">
              {["male", "female"].map((g) => (
                <button key={g} onClick={() => setGender(g)}
                  className={`px-3 py-1 rounded-md text-xs capitalize ${gender === g ? "bg-background text-primary font-bold shadow-sm" : "text-muted-foreground"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Date of Birth</span>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-accent border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Income</span>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)}
              className="w-24 text-right bg-accent border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" placeholder="0.00" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Currency</span>
            <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="w-24 text-right bg-accent border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" placeholder="EGP" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Unit System</span>
            <div className="flex bg-accent rounded-lg p-1">
              {["metric", "imperial"].map((sys) => (
                <button key={sys} onClick={() => setUnitSystem(sys)}
                  className={`px-3 py-1 rounded-md text-xs capitalize ${unitSystem === sys ? "bg-background text-primary font-bold shadow-sm" : "text-muted-foreground"}`}>
                  {sys}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <div className="flex bg-accent rounded-lg p-1">
              {(["light", "dark", "system"] as const).map((opt) => (
                <button key={opt} onClick={() => setTheme(opt)}
                  className={`px-3 py-1 rounded-md text-xs capitalize ${theme === opt ? "bg-background text-primary font-bold shadow-sm" : "text-muted-foreground"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={isPending}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-black uppercase tracking-wider hover:bg-primary/80 transition-all disabled:opacity-50">
        {isPending ? "Saving..." : "Save Profile Changes"}
      </button>

      <button onClick={handleLogout}
        className="w-full py-3.5 bg-destructive/10 text-destructive rounded-xl text-sm font-black uppercase tracking-wider hover:bg-destructive/20 transition-all">
        Sign Out
      </button>
    </div>
  )
}

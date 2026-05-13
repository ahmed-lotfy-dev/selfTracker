import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"
import { updateUser } from "../lib/api/userApi"
import { axiosInstance } from "../lib/api/config"

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name || "")
  const [weight, setWeight] = useState(user?.weight?.toString() || "")
  const [height, setHeight] = useState(user?.height?.toString() || "")
  const [gender, setGender] = useState(user?.gender || "male")
  const [unitSystem, setUnitSystem] = useState(user?.unitSystem || "metric")
  const [theme, setTheme] = useState(user?.theme || "system")
  const [currency, setCurrency] = useState(user?.currency || "EGP")
  const [income, setIncome] = useState(user?.income?.toString() || "")
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "")
  const [isPending, setIsPending] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.image || "")

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setWeight(user.weight?.toString() || "")
      setHeight(user.height?.toString() || "")
      setGender(user.gender || "male")
      setUnitSystem(user.unitSystem || "metric")
      setTheme(user.theme || "system")
      setCurrency(user.currency || "EGP")
      setIncome(user.income?.toString() || "")
      setDateOfBirth(user.dateOfBirth || "")
      setAvatarUrl(user.image || "")
    }
  }, [user])

  const handleImagePick = async () => {
    fileInputRef.current?.click()
  }

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
    if (!user?.id) return
    setIsPending(true)
    try {
      const payload: Record<string, any> = { id: user.id, name, gender, unitSystem, currency, theme }
      if (weight) payload.weight = parseFloat(weight)
      if (height) payload.height = parseFloat(height)
      if (income) payload.income = parseFloat(income)
      if (dateOfBirth) payload.dateOfBirth = dateOfBirth
      if (avatarUrl) payload.image = avatarUrl
      const updated = await updateUser(payload)
      setUser({ ...user, ...updated })
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsPending(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/sign-in")
  }

  const initial = user?.name?.charAt(0).toUpperCase() || "U"

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Profile Hero */}
      <div className="card pt-10 pb-10 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}>
        <div className="flex flex-col items-center">
          <button onClick={handleImagePick} className="relative mb-6 group">
            <div className="w-40 h-40 rounded-full flex items-center justify-center border-4 border-white/10 overflow-hidden bg-white/5 mx-auto">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-6xl font-black text-white/20">{initial}</span>
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-white p-3 rounded-full border-4 border-[#1e1b4b] shadow-lg group-hover:scale-110 transition-transform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
          </button>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="text-center text-4xl font-black text-white bg-transparent border-none outline-none w-full max-w-md tracking-tighter"
            placeholder="User Name" />
          <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5 mt-1">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Physical Stats */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Physical Stats</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span className="text-sm text-gray-300">Weight</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                className="w-24 text-right bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" placeholder="0" />
              <span className="text-xs text-gray-500">{unitSystem === "imperial" ? "lbs" : "kg"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              <span className="text-sm text-gray-300">Height</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                className="w-24 text-right bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" placeholder="0" />
              <span className="text-xs text-gray-500">{unitSystem === "imperial" ? "in" : "cm"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="text-sm text-gray-300">Gender</span>
            </div>
            <div className="flex bg-bg-hover rounded-lg p-1">
              {["male", "female"].map((g) => (
                <button key={g} onClick={() => setGender(g)}
                  className={`px-3 py-1 rounded-md text-xs capitalize ${gender === g ? "bg-[#06060a] text-brand-blue font-bold shadow-sm" : "text-gray-500"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="text-sm text-gray-300">Date of Birth</span>
            </div>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Preferences & Details</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-sm text-gray-300">Income</span>
            </div>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)}
              className="w-24 text-right bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" placeholder="0.00" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="1" y="3" width="22" height="18" rx="2" ry="2"/><line x1="1" y1="9" x2="23" y2="9"/></svg>
              <span className="text-sm text-gray-300">Currency</span>
            </div>
            <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="w-24 text-right bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" placeholder="EGP" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <span className="text-sm text-gray-300">Unit System</span>
            </div>
            <div className="flex bg-bg-hover rounded-lg p-1">
              {["metric", "imperial"].map((sys) => (
                <button key={sys} onClick={() => setUnitSystem(sys)}
                  className={`px-3 py-1 rounded-md text-xs capitalize ${unitSystem === sys ? "bg-[#06060a] text-brand-blue font-bold shadow-sm" : "text-gray-500"}`}>
                  {sys}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <span className="text-sm text-gray-300">Theme</span>
            </div>
            <div className="flex bg-bg-hover rounded-lg p-1">
              {(["light", "dark", "system"] as const).map((opt) => (
                <button key={opt} onClick={() => setTheme(opt)}
                  className={`px-3 py-1 rounded-md text-xs capitalize ${theme === opt ? "bg-[#06060a] text-brand-blue font-bold shadow-sm" : "text-gray-500"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={isPending}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-sm font-black uppercase tracking-[2px] text-white hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50">
        {isPending ? "Synchronizing..." : "Sync Profile Changes"}
      </button>

      {/* Sign Out */}
      <button onClick={handleLogout}
        className="w-full py-3.5 bg-gradient-to-r from-red-900 to-red-800 rounded-xl text-sm font-black uppercase tracking-[2px] text-white hover:from-red-800 hover:to-red-700 transition-all">
        Sign Out
      </button>
    </div>
  )
}

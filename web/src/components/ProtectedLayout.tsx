import { Link, Outlet, useLocation } from "react-router-dom"
import {
  LayoutDashboard, TrendingDown, Dumbbell, MessageSquare, Database,
  CheckSquare, Flame, Apple, User,
} from "lucide-react"
import { useAuthStore } from "../stores/authStore"

const nav = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/weights", label: "Weight", icon: TrendingDown },
  { path: "/workouts", label: "Workouts", icon: Dumbbell },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/habits", label: "Habits", icon: Flame },
  { path: "/nutrition", label: "Nutrition", icon: Apple },
  { path: "/ai", label: "AI Coach", icon: MessageSquare },
  { path: "/data", label: "Data", icon: Database },
  { path: "/profile", label: "Profile", icon: User },
]

export default function ProtectedLayout() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-screen w-60 bg-bg-card border-r border-bg-border flex flex-col z-50">
        <div className="p-5 border-b border-bg-border">
          <Link to="/" className="flex items-center gap-2">
            <LayoutDashboard className="text-brand-blue" size={22} />
            <h1 className="text-lg font-bold text-white">Lotfy Fitness</h1>
          </Link>
          <p className="text-[11px] text-gray-500 mt-0.5">SelfTracker Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 mt-2 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                    : "text-gray-500 hover:text-gray-200 hover:bg-bg-hover"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-bg-border space-y-2">
          <p className="text-[10px] text-gray-600">{user?.name}</p>
          <button onClick={() => logout()}
            className="text-[11px] text-gray-600 hover:text-brand-red transition-colors w-full text-left">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8 overflow-y-auto bg-[#06060a] min-h-screen">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

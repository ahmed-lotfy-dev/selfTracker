import { Activity, TrendingDown, Dumbbell, MessageSquare, Database } from 'lucide-react'

const nav = [
  { id: 'dashboard', label: 'Overview', icon: Activity },
  { id: 'weight', label: 'Weight Loss', icon: TrendingDown },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'ai', label: 'AI Coach', icon: MessageSquare },
  { id: 'data', label: 'Export & Data', icon: Database },
]

export default function Sidebar({ active, onChange }: { active: string; onChange: (p: string) => void }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-bg-card border-r border-bg-border flex flex-col z-50">
      <div className="p-5 border-b border-bg-border">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="text-brand-blue" size={22} />
          Lotfy Fitness
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">SelfTracker Dashboard</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {nav.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                isActive ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'text-gray-500 hover:text-gray-200 hover:bg-bg-hover'
              }`}>
              <Icon size={17} />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-bg-border">
        <div className="text-[10px] text-gray-600 space-y-0.5">
          <p>Neon DB Connected</p>
          <p>Qdrant AI Ready</p>
        </div>
      </div>
    </aside>
  )
}

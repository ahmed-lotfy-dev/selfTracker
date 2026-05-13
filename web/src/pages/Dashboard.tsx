import { Scale, Dumbbell, TrendingDown, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboard, useWeightStats, useWorkoutStats } from '../hooks/api'
import StatCard from '../components/StatCard'
import Loading from '../components/Loading'
import ErrorMsg from '../components/ErrorMsg'

export default function Dashboard() {
  const dash = useDashboard()
  const wStats = useWeightStats()
  const woStats = useWorkoutStats()

  if (wStats.error || woStats.error) {
    return <ErrorMsg msg={wStats.error?.message || woStats.error?.message || 'Failed to load'} />
  }
  if (!dash.data || !wStats.data || !woStats.data) return <Loading />

  const { data: d } = dash
  const { data: w } = wStats
  const { data: wo } = woStats

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {d.user?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-sm text-gray-500 mt-1">Here is your fitness overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Weight" value={`${w.weight.current} kg`}
          sub={`Start: ${w.weight.start} kg`} icon={<Scale size={18} />} color="blue" />
        <StatCard label="Total Change" value={`${w.weight.change > 0 ? '+' : ''}${w.weight.change} kg`}
          sub={`Min: ${w.weight.min} | Max: ${w.weight.max}`} icon={<TrendingDown size={18} />} color="green" />
        <StatCard label="Workout Sessions" value={wo.totalSessions}
          sub={`Current streak: ${wo.streaks.current} days`} icon={<Dumbbell size={18} />} color="purple" />
        <StatCard label="Weight Records" value={w.totalRecords}
          sub={`${w.dateRange.first?.slice(0, 10)} → ${w.dateRange.last?.slice(0, 10)}`} icon={<Activity size={18} />} color="cyan" />
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Weight Trend (Monthly Avg)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={w.monthly.map(m => ({ month: m.month, weight: m.avgWeight }))}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0c0c14', border: '1px solid #1a1a2e', borderRadius: 12, color: '#e2e8f0' }} />
            <Area type="monotone" dataKey="weight" stroke="#3b82f6" fill="url(#wGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Workout Types</h2>
          <div className="space-y-3">
            {Object.entries(wo.types).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
              const pct = Math.round(count / wo.totalSessions * 100)
              const c: Record<string, string> = { Push: 'bg-brand-blue', Pull: 'bg-brand-green', Legs: 'bg-brand-purple', Walking: 'bg-brand-orange', Cardio: 'bg-brand-cyan', Running: 'bg-brand-red' }
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-medium">{name}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c[name] || 'bg-brand-blue'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Energy & Mood</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-gray-500 mb-2 uppercase">Energy</p>
              {Object.entries(w.energy).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-bg-border">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-brand-blue font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-2 uppercase">Mood</p>
              {Object.entries(w.mood).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-bg-border">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-brand-green font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Workouts</h2>
        <div className="space-y-1">
          {wo.recentSessions.slice(0, 10).map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.name === 'Push' ? 'bg-brand-blue' : s.name === 'Pull' ? 'bg-brand-green' : s.name === 'Legs' ? 'bg-brand-purple' : 'bg-brand-orange'}`} />
                <span className="text-sm text-gray-200 font-medium">{s.name}</span>
              </div>
              <span className="text-xs text-gray-500">{s.date?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

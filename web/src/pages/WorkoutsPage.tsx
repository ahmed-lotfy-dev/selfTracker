import { Link } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Dumbbell, Calendar, Flame, Plus } from 'lucide-react'
import { useWorkoutStats, useWorkoutLogs } from '../hooks/api'
import Loading from '../components/Loading'
import ErrorMsg from '../components/ErrorMsg'

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ef4444']

export default function WorkoutsPage() {
  const stats = useWorkoutStats()
  const logs = useWorkoutLogs()

  if (stats.error) return <ErrorMsg msg={stats.error.message} />
  if (!stats.data) return <Loading />

  const { data: s } = stats
  const allLogs = logs.data ?? []

  const pieData = Object.entries(s.types).map(([name, value]) => ({ name, value }))
  const monthlyData = Object.entries(s.monthly).sort().map(([month, count]) => ({ month, count }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workout Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">{s.totalSessions} sessions logged</p>
        </div>
        <Link to="/workouts/add"
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg text-xs text-brand-purple hover:bg-brand-purple/20 transition-colors">
          <Plus size={14} /> Log Workout
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2"><Dumbbell size={16} className="text-brand-blue" /><p className="text-[12px] text-gray-500 uppercase tracking-wider">Total</p></div>
          <p className="text-2xl font-bold text-white mt-1">{s.totalSessions}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2"><Flame size={16} className="text-brand-orange" /><p className="text-[12px] text-gray-500 uppercase tracking-wider">Streak</p></div>
          <p className="text-2xl font-bold text-brand-orange mt-1">{s.streaks.current} days</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2"><Flame size={16} className="text-brand-red" /><p className="text-[12px] text-gray-500 uppercase tracking-wider">Best Streak</p></div>
          <p className="text-2xl font-bold text-brand-red mt-1">{s.streaks.max} days</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2"><Calendar size={16} className="text-brand-purple" /><p className="text-[12px] text-gray-500 uppercase tracking-wider">Range</p></div>
          <p className="text-sm font-bold text-white mt-1">{s.dateRange.first?.slice(0, 10)}</p>
          <p className="text-xs text-gray-500">→ {s.dateRange.last?.slice(0, 10)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0c0c14', border: '1px solid #1a1a2e', borderRadius: 12, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Monthly Frequency</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0c0c14', border: '1px solid #1a1a2e', borderRadius: 12, color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Type Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(s.types).sort((a, b) => b[1] - a[1]).map(([name, count], i) => (
            <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-bg-hover border border-bg-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-gray-200 font-medium">{name}</span>
              </div>
              <span className="text-sm text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">All Sessions</h2>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-bg-border">
                <th className="text-left py-2 px-3">#</th>
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {allLogs.map((l, i) => (
                <tr key={l.id} onClick={() => window.location.hash = `#/workouts/${l.id}/edit`}
                  className="border-b border-bg-border hover:bg-bg-hover cursor-pointer">
                  <td className="py-2 px-3 text-gray-600">{allLogs.length - i}</td>
                  <td className="py-2 px-3 text-gray-300">{l.createdAt?.slice(0, 10)}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      l.workoutName === 'Push' ? 'bg-brand-blue/10 text-brand-blue' :
                      l.workoutName === 'Pull' ? 'bg-brand-green/10 text-brand-green' :
                      l.workoutName === 'Legs' ? 'bg-brand-purple/10 text-brand-purple' :
                      'bg-brand-orange/10 text-brand-orange'
                    }`}>{l.workoutName}</span>
                  </td>
                  <td className="py-2 px-3 text-gray-500 text-xs max-w-xs truncate">{l.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

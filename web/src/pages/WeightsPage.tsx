import { Link } from "react-router-dom"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingDown, TrendingUp, Plus } from 'lucide-react'
import { useWeightStats, useWeightLogs } from '../hooks/api'
import Loading from '../components/Loading'
import ErrorMsg from '../components/ErrorMsg'

export default function WeightsPage() {
  const stats = useWeightStats()
  const logs = useWeightLogs()

  if (stats.error) return <ErrorMsg msg={stats.error.message} />
  if (!stats.data) return <Loading />

  const chartData = (logs.data ?? []).map(l => ({
    date: l.createdAt?.slice(0, 10),
    weight: parseFloat(l.weight),
  }))

  const { data: s } = stats
  const allLogs = logs.data ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Weight Loss Journey</h1>
          <p className="text-sm text-gray-500 mt-1">{s.totalRecords} records tracked</p>
        </div>
        <Link to="/weights/add"
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-xs text-brand-blue hover:bg-brand-blue/20 transition-colors">
          <Plus size={14} /> Log Weight
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-[12px] text-gray-500 uppercase tracking-wider">Starting</p>
          <p className="text-2xl font-bold text-white mt-1">{s.weight.start} kg</p>
          <p className="text-[11px] text-gray-600">{s.dateRange.first?.slice(0, 10)}</p>
        </div>
        <div className="stat-card">
          <p className="text-[12px] text-gray-500 uppercase tracking-wider">Current (DB)</p>
          <p className="text-2xl font-bold text-brand-blue mt-1">{s.weight.current} kg</p>
          <p className="text-[11px] text-gray-600">{s.dateRange.last?.slice(0, 10)}</p>
        </div>
        <div className="stat-card">
          <p className="text-[12px] text-gray-500 uppercase tracking-wider">Total Change</p>
          <p className={`text-2xl font-bold mt-1 ${s.weight.change <= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
            {s.weight.change > 0 ? '+' : ''}{s.weight.change} kg
          </p>
          <div className="flex items-center gap-1 mt-1">
            {s.weight.change <= 0 ? <TrendingDown size={14} className="text-brand-green" /> : <TrendingUp size={14} className="text-brand-red" />}
            <span className="text-[11px] text-gray-500">{s.weight.change <= 0 ? 'Lost' : 'Gained'}</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="text-[12px] text-gray-500 uppercase tracking-wider">All-time Low</p>
          <p className="text-2xl font-bold text-brand-purple mt-1">{s.weight.min} kg</p>
          <p className="text-[11px] text-gray-600">Best recorded</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Full Weight History</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="wGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0c0c14', border: '1px solid #1a1a2e', borderRadius: 12, color: '#e2e8f0' }}
              formatter={(v: number) => [`${v} kg`, 'Weight']} />
            <Area type="monotone" dataKey="weight" stroke="#3b82f6" fill="url(#wGrad2)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Monthly Average</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={s.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0c0c14', border: '1px solid #1a1a2e', borderRadius: 12, color: '#e2e8f0' }}
              formatter={(v: number) => [`${v} kg`, 'Avg Weight']} />
            <Bar dataKey="avgWeight" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Entries</h2>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-bg-border">
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Weight</th>
                <th className="text-left py-2 px-3">Energy</th>
                <th className="text-left py-2 px-3">Mood</th>
                <th className="text-left py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[...allLogs].reverse().slice(0, 40).map(l => (
                <tr key={l.id} onClick={() => window.location.hash = `#/weights/${l.id}/edit`}
                  className="border-b border-bg-border hover:bg-bg-hover cursor-pointer">
                  <td className="py-2 px-3 text-gray-300">{l.createdAt?.slice(0, 10)}</td>
                  <td className="py-2 px-3 text-brand-blue font-medium">{l.weight} kg</td>
                  <td className="py-2 px-3 text-gray-400">{l.energy || '—'}</td>
                  <td className="py-2 px-3 text-gray-400">{l.mood || '—'}</td>
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

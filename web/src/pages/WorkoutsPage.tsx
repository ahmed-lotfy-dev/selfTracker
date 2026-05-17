import { useState, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Dumbbell, Calendar, Flame, Plus, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { useWorkoutStats, useWorkoutLogs } from '../hooks/api'
import { getWorkoutLogsForCalendar } from '../lib/api/workoutLogsApi'
import type { WorkoutLog } from '../lib/api/workoutLogsApi'
import Loading from '../components/Loading'
import ErrorMsg from '../components/ErrorMsg'

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ef4444']

const TYPE_COLORS: Record<string, string> = {
  Push: '#3b82f6',
  Pull: '#22c55e',
  Legs: '#a855f7',
  Walking: '#f97316',
  Cardio: '#06b6d4',
  Running: '#ef4444',
}

function getWorkoutColor(name: string): string {
  return TYPE_COLORS[name] || '#f97316'
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function WorkoutCalendar({ logs, selectedDate, onSelectDate }: {
  logs: WorkoutLog[]
  selectedDate: string
  onSelectDate: (d: string) => void
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)

  const workoutByDate = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    for (const l of logs) {
      const d = l.createdAt.slice(0, 10)
      if (!map[d]) map[d] = {}
      map[d][l.workoutName] = (map[d][l.workoutName] || 0) + 1
    }
    return map
  }, [logs])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const prevMonth = useCallback(() => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }, [viewMonth])

  const cells = []
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="aspect-square" />)
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toDateStr(viewYear, viewMonth, day)
    const dayWorkouts = workoutByDate[dateStr]
    const isToday = dateStr === todayStr
    const isSelected = dateStr === selectedDate
    const hasWorkouts = !!dayWorkouts
    const types = dayWorkouts ? Object.keys(dayWorkouts) : []

    cells.push(
      <button
        key={dateStr}
        onClick={() => onSelectDate(dateStr)}
        className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs transition-all relative
          ${isSelected ? 'bg-brand-purple/20 border border-brand-purple/50 ring-1 ring-brand-purple/30' : ''}
          ${isToday && !isSelected ? 'bg-white/5 border border-white/10' : ''}
          ${!isSelected && !isToday ? 'hover:bg-bg-hover border border-transparent' : ''}
          ${hasWorkouts ? 'text-white font-semibold' : 'text-gray-500'}
        `}
      >
        <span className="text-[11px] leading-none">{day}</span>
        {types.length > 0 && (
          <div className="flex gap-0.5 flex-wrap justify-center">
            {types.slice(0, 3).map((t, idx) => (
              <div
                key={idx}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: getWorkoutColor(t) }}
              />
            ))}
          </div>
        )}
      </button>
    )
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-bg-hover text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <h3 className="text-sm font-bold text-white">{MONTH_NAMES[viewMonth - 1]} {viewYear}</h3>
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-bg-hover text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-600 font-semibold uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {Object.entries(TYPE_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WorkoutsPage() {
  const stats = useWorkoutStats()
  const logs = useWorkoutLogs()
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })

  if (stats.error) return <ErrorMsg msg={stats.error.message} />
  if (!stats.data) return <Loading />

  const { data: s } = stats
  const allLogs = logs.data ?? []

  const pieData = Object.entries(s.types).map(([name, value]) => ({ name, value }))
  const monthlyData = Object.entries(s.monthly).sort().map(([month, count]) => ({ month, count }))

  const selectedDayLogs = useMemo(() => {
    return allLogs.filter(l => l.createdAt.slice(0, 10) === selectedDate)
  }, [allLogs, selectedDate])

  const selectedDateLabel = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }, [selectedDate])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workout Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">{s.totalSessions} sessions logged</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-bg-hover rounded-lg p-0.5 border border-bg-border">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-brand-purple/20 text-brand-purple'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Calendar size={13} /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-purple/20 text-brand-purple'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <List size={13} /> List
            </button>
          </div>
          <Link to="/workouts/add"
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg text-xs text-brand-purple hover:bg-brand-purple/20 transition-colors">
            <Plus size={14} /> Log Workout
          </Link>
        </div>
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

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card">
            <WorkoutCalendar
              logs={allLogs}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
          <div className="lg:col-span-2 card">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white">{selectedDateLabel}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedDayLogs.length} workout{selectedDayLogs.length !== 1 ? 's' : ''}
              </p>
            </div>
            {selectedDayLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Dumbbell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No workouts on this day</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedDayLogs.map(l => (
                  <div
                    key={l.id}
                    onClick={() => window.location.hash = `#/workouts/${l.id}/edit`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-hover border border-bg-border hover:border-bg-border/80 cursor-pointer transition-colors"
                  >
                    <div
                      className="w-2 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: getWorkoutColor(l.workoutName) }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          l.workoutName === 'Push' ? 'bg-brand-blue/10 text-brand-blue' :
                          l.workoutName === 'Pull' ? 'bg-brand-green/10 text-brand-green' :
                          l.workoutName === 'Legs' ? 'bg-brand-purple/10 text-brand-purple' :
                          'bg-brand-orange/10 text-brand-orange'
                        }`}>{l.workoutName}</span>
                      </div>
                      {l.notes && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{l.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
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
      )}
    </div>
  )
}

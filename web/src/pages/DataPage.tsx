import { Download, FileJson, FileText } from 'lucide-react'
import { useDashboard, useWeightStats, useWorkoutStats } from '../hooks/api'
import { API_BASE_URL, getToken } from '../lib/api/config'
import Loading from '../components/Loading'
import ErrorMsg from '../components/ErrorMsg'

export default function DataPage() {
  const dash = useDashboard()
  const wStats = useWeightStats()
  const woStats = useWorkoutStats()

  if (!dash.data || wStats.error) return wStats.error ? <ErrorMsg msg={wStats.error.message} /> : <Loading />

  const download = (content: string, filename: string, type = 'application/json') => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = async (endpoint: string, filename: string) => {
    try {
      const res = await fetch(API_BASE_URL + '/api' + endpoint, { headers: { Authorization: `Bearer ${getToken()}` } })
      const json = await res.json()
      download(JSON.stringify(json, null, 2), filename)
    } catch { alert('Export failed') }
  }

  const w = wStats.data
  const wo = woStats.data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Export & Data</h1>
        <p className="text-sm text-gray-500 mt-1">Download your full fitness data for AI training, backups, or analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <FileJson size={20} className="text-brand-blue" />
            <h2 className="text-sm font-semibold text-gray-300">Weight Data</h2>
          </div>
          <p className="text-xs text-gray-500">
            {w ? `${w.totalRecords} weight records from ${w.dateRange.first?.slice(0, 10)} to ${w.dateRange.last?.slice(0, 10)}` : 'Loading...'}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => exportJSON('/weight-stats', 'weight_stats.json')}
              className="flex items-center gap-2 px-3 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-xs text-brand-blue hover:bg-brand-blue/20 transition-colors">
              <Download size={14} /> weight_stats.json
            </button>
            <button onClick={() => exportJSON('/weight-logs?limit=500', 'weight_logs_full.json')}
              className="flex items-center gap-2 px-3 py-2 bg-bg-hover border border-bg-border rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
              <Download size={14} /> All Logs JSON
            </button>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <FileJson size={20} className="text-brand-purple" />
            <h2 className="text-sm font-semibold text-gray-300">Workout Data</h2>
          </div>
          <p className="text-xs text-gray-500">
            {wo ? `${wo.totalSessions} sessions: ${Object.entries(wo.types).sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n} (${c})`).join(', ')}` : 'Loading...'}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => exportJSON('/workout-stats', 'workout_stats.json')}
              className="flex items-center gap-2 px-3 py-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg text-xs text-brand-purple hover:bg-brand-purple/20 transition-colors">
              <Download size={14} /> workout_stats.json
            </button>
            <button onClick={() => exportJSON('/workout-logs?limit=500', 'workout_logs_full.json')}
              className="flex items-center gap-2 px-3 py-2 bg-bg-hover border border-bg-border rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
              <Download size={14} /> All Logs JSON
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={20} className="text-brand-green" />
          <h2 className="text-sm font-semibold text-gray-300">AI-Ready Profile Report (.md)</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Structured Markdown report that any AI agent can read to understand your full fitness profile</p>
        <button onClick={() => {
          const md = `# A. Lotfy - Fitness Profile Report
# Generated: ${new Date().toISOString()}

## Status
- Current Weight: ${w?.weight.current ?? '?'} kg (${w ? new Date(w.dateRange.last).toLocaleDateString() : '?'}, self-reported)
- Starting Weight: ${w?.weight.start ?? '?'} kg (${w ? new Date(w.dateRange.first).toLocaleDateString() : '?'})
- Lowest Weight: ${w?.weight.min ?? '?'} kg
- Weight Records: ${w?.totalRecords ?? '?'}
- Workout Sessions: ${wo?.totalSessions ?? '?'}

## Training Split: PPL${wo ? '\n' + Object.entries(wo.types).sort((a, b) => b[1] - a[1]).map(([n, c]) => `- ${n}: ${c} sessions`).join('\n') : ''}

## Key Patterns
- Energy: Mostly "${Object.entries(w?.energy ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'}" and "${Object.entries(w?.energy ?? {}).sort((a, b) => b[1] - a[1])[1]?.[0] ?? 'N/A'}"
- Mood: Mostly "${Object.entries(w?.mood ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'}"
- Back injury: Sept 2024, recovered with deload
- Current phase: Body recomposition

## PPL Routine

### Day 1: Push (Chest & Tricep)
- DB Bench Press: 4 sets x 10-12
- DB Fly: 4 sets x 12
- DB Seated Tricep Press: 4 sets x 12
- DB Incline Bench Press: 4 sets x 10-12

### Day 2: Pull (Back & Biceps)
- DB Stiff-Leg Deadlift: 4 sets x 10-12
- DB Hammer Curl: 4 sets x 12
- DB Bent-Over Row (Palms In): 4 sets x 12
- DB Shoulder Shrug: 4 sets x 15
- DB One-Arm Row: 3 sets x 10-12

### Day 3: Shoulders
- DB Lateral Raise: 4 sets x 15
- DB Shoulder Press: 4 sets x 10-12
- DB Seated Bent-Over Reverse Fly: 4 sets x 12-15
- DB One-Arm Front Raise: 3 sets x 12
- DB Upright Row: 3 sets x 12

### Day 4: Legs
- DB Goblet Squats: 4 sets x 12-15
- DB Lunges: 3 sets x 10/leg
- DB Calf Raises: 4 sets x 15-20

## AI Integration Notes
- Primary KPI: Total Weight Lifted (Volume) per session
- Scale weight ${w ? `${w.weight.current}-${w.weight.max}` : '?'}kg is maintenance/recomp phase
- Flag "Low Energy" or "Low Mood" as overtraining markers
- Correlate Leg Day frequency with weight loss
`
          download(md, 'fitness_profile.md', 'text/markdown')
        }} className="flex items-center gap-2 px-3 py-2 bg-brand-green/10 border border-brand-green/20 rounded-lg text-xs text-brand-green hover:bg-brand-green/20 transition-colors">
          <Download size={14} /> AI_Profile_Report.md
        </button>
      </div>

      <div className="text-xs text-gray-600">
        <p>Data sourced from backend API • Exported {new Date().toISOString().slice(0, 10)}</p>
      </div>
    </div>
  )
}

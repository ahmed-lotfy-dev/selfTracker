import { FileJson, FileText, Download } from 'lucide-react'
import axiosInstance from "@/lib/api/axiosInstance"

const API_BASE_URL = axiosInstance.defaults.baseURL

export default function DataPage() {
  const download = (content: string, filename: string, type = 'application/json') => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = async (endpoint: string, filename: string) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const res = await fetch(API_BASE_URL + endpoint, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      download(JSON.stringify(json, null, 2), filename)
    } catch { alert('Export failed') }
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export & Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Download your full fitness data for AI training, backups, or analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileJson size={20} className="text-[#0EA5E9]" />
            <h2 className="text-sm font-semibold">Weight Data</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => exportJSON('/api/weight-stats', 'weight_stats.json')}
              className="flex items-center gap-2 px-3 py-2 bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-lg text-xs text-[#0EA5E9] hover:bg-[#0EA5E9]/20 transition-colors">
              <Download size={14} /> weight_stats.json
            </button>
            <button onClick={() => exportJSON('/api/weight-logs?limit=500', 'weight_logs_full.json')}
              className="flex items-center gap-2 px-3 py-2 bg-accent border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Download size={14} /> All Logs JSON
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileJson size={20} className="text-[#A855F7]" />
            <h2 className="text-sm font-semibold">Workout Data</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => exportJSON('/api/workout-stats', 'workout_stats.json')}
              className="flex items-center gap-2 px-3 py-2 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-lg text-xs text-[#A855F7] hover:bg-[#A855F7]/20 transition-colors">
              <Download size={14} /> workout_stats.json
            </button>
            <button onClick={() => exportJSON('/api/workout-logs?limit=500', 'workout_logs_full.json')}
              className="flex items-center gap-2 px-3 py-2 bg-accent border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Download size={14} /> All Logs JSON
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={20} className="text-[#10B981]" />
          <h2 className="text-sm font-semibold">AI-Ready Profile Report (.md)</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Structured Markdown report that any AI agent can read to understand your full fitness profile</p>
        <button onClick={() => {
          const md = `# SelfTracker - Fitness Profile Report
# Generated: ${new Date().toISOString()}

## Status
- Weight tracking active
- Workout tracking active

## Key Patterns
- Data exported from SelfTracker

## AI Integration Notes
- Full fitness tracking data available in JSON format above
`
          download(md, 'fitness_profile.md', 'text/markdown')
        }} className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/20 transition-colors">
          <Download size={14} /> AI_Profile_Report.md
        </button>
      </div>

      <div className="text-xs text-muted-foreground/60">
        <p>Data sourced from backend API • Exported {new Date().toISOString().slice(0, 10)}</p>
      </div>
    </div>
  )
}

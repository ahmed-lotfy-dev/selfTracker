import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check } from "lucide-react"
import { createHabit } from "../../lib/api/habitsApi"

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
]

export default function AddHabit() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[5])
  const [error, setError] = useState("")

  const mutation = useMutation({
    mutationFn: () => createHabit({ name: name.trim(), color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      navigate("/habits")
    },
    onError: (e: any) => setError(e.message),
  })

  const handleSubmit = () => {
    if (!name.trim()) { setError("Habit name is required"); return }
    setError("")
    mutation.mutate()
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 pt-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/habits")} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Habit</h1>
        </div>
      </div>

      <div className="card border-white/10">
        {/* Habit Identity */}
        <div className="mb-6">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Habit Identity</p>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError("") }}
            placeholder="e.g. Morning Meditation"
            autoFocus
            className="w-full px-5 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg font-semibold placeholder-white/20 focus:outline-none focus:border-brand-blue/50"
          />
          {error && <p className="text-red-400 text-[10px] mt-1 ml-2 font-bold uppercase">{error}</p>}
        </div>

        {/* Visual Signature */}
        <div>
          <div className="flex items-center justify-between mb-3 ml-1">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Visual Signature</p>
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="aspect-square rounded-2xl flex items-center justify-center border-2 transition-all"
                style={{
                  backgroundColor: color === c ? `${c}20` : "rgba(255,255,255,0.03)",
                  borderColor: color === c ? c : "rgba(255,255,255,0.05)",
                }}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                {color === c && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <Check size={10} color={c} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="w-full py-4 rounded-3xl text-lg font-bold tracking-tight bg-brand-blue text-white hover:bg-brand-blue/80 transition-all disabled:opacity-50 shadow-lg shadow-brand-blue/30"
      >
        {mutation.isPending ? "Deploying..." : "Deploy Habit"}
      </button>

      <p className="text-white/20 text-center text-[10px] uppercase tracking-tighter">
        System sync will occur immediately after deployment
      </p>
    </div>
  )
}

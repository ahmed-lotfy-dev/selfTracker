import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/api/config"
import { ArrowLeft } from "lucide-react"

export default function AddWeight() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [weight, setWeight] = useState("")
  const [energy, setEnergy] = useState<"Low" | "Okay" | "Good" | "Great" | "">("")
  const [mood, setMood] = useState<"Low" | "Medium" | "High" | "">("")
  const [notes, setNotes] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/api/weightLogs", {
        weight,
        energy: energy || undefined,
        mood: mood || undefined,
        notes: notes || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness"] })
      navigate("/weights")
    },
  })

  return (
    <div className="max-w-lg mx-auto space-y-8 pt-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/weights")} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Log Weight</h1>
          <p className="text-sm text-gray-500 mt-1">Record your weight entry</p>
        </div>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Weight (kg)</label>
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" placeholder="85.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Energy</label>
          <select value={energy} onChange={(e) => setEnergy(e.target.value as any)}
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50">
            <option value="">Select...</option>
            <option value="Low">Low</option>
            <option value="Okay">Okay</option>
            <option value="Good">Good</option>
            <option value="Great">Great</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mood</label>
          <select value={mood} onChange={(e) => setMood(e.target.value as any)}
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50">
            <option value="">Select...</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50 resize-none" placeholder="How are you feeling?" />
        </div>
        <button onClick={() => mutation.mutate()} disabled={!weight || mutation.isPending}
          className="w-full py-3 bg-brand-blue rounded-xl text-sm font-medium hover:bg-brand-blue/80 transition-colors disabled:opacity-40">
          {mutation.isPending ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  )
}

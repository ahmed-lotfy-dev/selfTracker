import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/api/config"
import { getWeightLogs } from "../../lib/api/weightLogsApi"
import { ArrowLeft } from "lucide-react"

export default function EditWeight() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: logs } = useQuery({
    queryKey: ["weightLogs"],
    queryFn: () => getWeightLogs(),
  })

  const entry = logs?.logs?.find((l) => l.id === id)

  const [weight, setWeight] = useState("")
  const [energy, setEnergy] = useState("")
  const [mood, setMood] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (entry) {
      setWeight(entry.weight)
      setEnergy(entry.energy || "")
      setMood(entry.mood || "")
      setNotes(entry.notes || "")
    }
  }, [entry])

  const mutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(`/api/weightLogs/${id}`, {
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

  if (!entry) return <div className="text-gray-500 p-8">Loading...</div>

  return (
    <div className="max-w-lg mx-auto space-y-8 pt-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/weights")} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Weight</h1>
        </div>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Weight (kg)</label>
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Energy</label>
          <select value={energy} onChange={(e) => setEnergy(e.target.value)}
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
          <select value={mood} onChange={(e) => setMood(e.target.value)}
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
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50 resize-none" />
        </div>
        <button onClick={() => mutation.mutate()} disabled={!weight || mutation.isPending}
          className="w-full py-3 bg-brand-blue rounded-xl text-sm font-medium hover:bg-brand-blue/80 transition-colors disabled:opacity-40">
          {mutation.isPending ? "Saving..." : "Update Entry"}
        </button>
      </div>
    </div>
  )
}

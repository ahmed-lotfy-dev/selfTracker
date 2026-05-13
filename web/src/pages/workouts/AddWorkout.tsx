import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../../lib/api/config"
import { ArrowLeft } from "lucide-react"

export default function AddWorkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [workoutName, setWorkoutName] = useState("")
  const [notes, setNotes] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/api/workoutLogs", {
        workoutId: "new",
        workoutName,
        notes: notes || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness"] })
      navigate("/workouts")
    },
  })

  return (
    <div className="max-w-lg mx-auto space-y-8 pt-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/workouts")} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Log Workout</h1>
          <p className="text-sm text-gray-500 mt-1">Record your workout session</p>
        </div>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Workout Type</label>
          <select value={workoutName} onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50">
            <option value="">Select...</option>
            <option value="Push">Push</option>
            <option value="Pull">Pull</option>
            <option value="Legs">Legs</option>
            <option value="Walking">Walking</option>
            <option value="Cardio">Cardio</option>
            <option value="Running">Running</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50 resize-none" placeholder="How did it go?" />
        </div>
        <button onClick={() => mutation.mutate()} disabled={!workoutName || mutation.isPending}
          className="w-full py-3 bg-brand-purple rounded-xl text-sm font-medium hover:bg-brand-purple/80 transition-colors disabled:opacity-40">
          {mutation.isPending ? "Saving..." : "Save Workout"}
        </button>
      </div>
    </div>
  )
}

import { useOptimistic } from "react"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Flame, Check, Plus, Trash2, Trophy } from "lucide-react"
import { getHabits, toggleHabitCompletion } from "../lib/api/habitsApi"
import type { Habit } from "../lib/api/habitsApi"
import Loading from "../components/Loading"
import ErrorMsg from "../components/ErrorMsg"

function today() {
  return new Date().toISOString().split("T")[0]
}

export default function HabitsPage() {
  const queryClient = useQueryClient()
  const { data: habits, isLoading, error } = useQuery({
    queryKey: ["habits"],
    queryFn: getHabits,
  })

  const active = (habits ?? []).filter((h) => !h.deletedAt)

  const [optimisticHabits, addOptimistic] = useOptimistic(
    active,
    (prev, habitId: string) =>
      prev.map((h) => {
        if (h.id !== habitId) return h
        const wasDone = h.completionDates?.includes(today())
        return {
          ...h,
          completionDates: wasDone
            ? h.completionDates.filter((d) => d !== today())
            : [...(h.completionDates || []), today()],
        }
      })
  )

  const completedCount = optimisticHabits.filter((h) =>
    h.completionDates?.includes(today())
  ).length
  const rate =
    optimisticHabits.length > 0
      ? Math.round((completedCount / optimisticHabits.length) * 100)
      : 0

  const handleToggle = async (habit: Habit) => {
    const wasCompleted = habit.completionDates?.includes(today()) ?? false
    addOptimistic(habit.id)
    try {
      await toggleHabitCompletion(habit.id, today(), !wasCompleted)
      queryClient.setQueryData(["habits"], (old: Habit[] | undefined) => {
        if (!old) return old
        return old.map((h) => {
          if (h.id !== habit.id) return h
          return {
            ...h,
            completionDates: wasCompleted
              ? h.completionDates.filter((d) => d !== today())
              : [...(h.completionDates || []), today()],
          }
        })
      })
    } catch {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    }
  }

  const handleDelete = async (habit: Habit) => {
    addOptimistic(habit.id)
    try {
      await toggleHabitCompletion(habit.id, today(), false)
      queryClient.setQueryData(["habits"], (old: Habit[] | undefined) => {
        if (!old) return old
        return old.filter((h) => h.id !== habit.id)
      })
    } catch {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    }
  }

  if (isLoading) return <Loading />
  if (error) return <ErrorMsg msg={(error as Error).message} />

  return (
    <div className="space-y-6">
      <div
        className="card overflow-hidden border-indigo-500/20"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.05))" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Daily Mastery</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-extrabold text-white">{rate}%</span>
              {rate === 100 && optimisticHabits.length > 0 && (
                <span className="bg-yellow-500/20 px-2 py-0.5 rounded-md text-yellow-500 text-[10px] font-black">FLAWLESS</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center bg-white/5 w-16 h-16 rounded-3xl border border-white/10">
            <Trophy size={28} className={rate >= 50 ? "text-yellow-400" : "text-white/40"} />
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rate}%`, background: "linear-gradient(90deg, #6366f1, #a855f7)" }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs font-medium">{completedCount} of {optimisticHabits.length} habits locked in</span>
          <span className="text-white/20 text-[10px] uppercase font-bold">Live Pulse</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/70 text-sm font-bold uppercase tracking-tighter">Active Reputation</span>
        <Link to="/habits/add"
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-xs text-brand-blue hover:bg-brand-blue/20 transition-colors">
          <Plus size={14} /> Add Habit
        </Link>
      </div>

      {optimisticHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-[30px] bg-white/5 flex items-center justify-center border border-white/10 mb-6">
            <Flame size={40} className="text-white/10" />
          </div>
          <p className="text-xl font-bold text-white text-center mb-2">Zero Friction Environment</p>
          <p className="text-white/30 text-center text-sm max-w-md">You haven't defined any habits yet. Start with something so small it's impossible to fail.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {optimisticHabits.map((habit) => {
            const done = habit.completionDates?.includes(today())
            return (
              <div key={habit.id} onClick={() => handleToggle(habit)}
                className="card border-white/10 hover:border-white/20 transition-all relative overflow-hidden cursor-pointer"
                style={{
                  background: done
                    ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color || "#6366f1" }} />
                      <span className={`text-lg font-bold leading-tight ${done ? "text-green-400 line-through opacity-60" : "text-white"}`}>{habit.name}</span>
                    </div>
                    <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{done ? "Goal achieved for today" : "Daily Dedication"}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleToggle(habit) }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shrink-0 ${done ? "bg-green-500 border-green-400" : "bg-white/5 border-white/10"}`}>
                    {done ? <Check size={24} className="text-white" strokeWidth={3} /> : <div className="w-6 h-6 rounded-full border-2 border-white/20" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
                      <Flame size={12} className={habit.streak > 0 ? "text-orange-400" : "text-white/30"} />
                      <span className="text-[11px] font-bold text-white/70">{habit.streak} Day Streak</span>
                    </div>
                    {habit.lastCompletedAt && <span className="text-[10px] text-white/20">Last: {new Date(habit.lastCompletedAt).toLocaleDateString()}</span>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(habit) }} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

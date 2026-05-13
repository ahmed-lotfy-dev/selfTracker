import { useOptimistic, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Plus, Trash2, Edit3, X, CheckCircle } from "lucide-react"
import { getTasks, createTask, updateTask, deleteTask } from "../lib/api/tasksApi"
import type { Task } from "../lib/api/tasksApi"
import Loading from "../components/Loading"

export default function TasksPage() {
  const queryClient = useQueryClient()
  const { data: tasks, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: getTasks })
  const [newTitle, setNewTitle] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const active = (tasks ?? []).filter((t) => !t.deletedAt)

  const [optimistic, addOptimistic] = useOptimistic(active, (prev, action: { type: "toggle" | "add" | "delete" | "update"; task?: Task; id?: string }) => {
    switch (action.type) {
      case "toggle":
        return prev.map((t) => (t.id === action.task!.id ? { ...t, completed: !t.completed } : t))
      case "add":
        return action.task ? [action.task, ...prev] : prev
      case "delete":
        return prev.filter((t) => t.id !== action.id)
      case "update":
        return prev.map((t) => (t.id === action.task!.id ? { ...t, ...action.task } : t))
      default:
        return prev
    }
  })

  const total = optimistic.length
  const completed = optimistic.filter((t) => t.completed).length
  const progress = total === 0 ? 0 : (completed / total) * 100

  const toggleCache = (id: string) => {
    queryClient.setQueryData(["tasks"], (old: Task[] | undefined) => {
      if (!old) return old
      return old.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    })
  }

  const handleToggle = async (task: Task) => {
    addOptimistic({ type: "toggle", task })
    try {
      await updateTask(task.id, { completed: !task.completed })
      toggleCache(task.id)
    } catch {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    }
  }

  const handleAdd = async () => {
    const title = newTitle.trim()
    if (!title) return
    const temp: Task = {
      id: crypto.randomUUID(), userId: "", title, completed: false,
      category: "general", createdAt: new Date().toISOString(), updatedAt: "",
      deletedAt: null, dueDate: null, description: null,
      projectId: null, columnId: null, priority: "medium", order: 0, completedAt: null,
    }
    addOptimistic({ type: "add", task: temp })
    setNewTitle("")
    try {
      const created = await createTask({ title })
      queryClient.setQueryData(["tasks"], (old: Task[] | undefined) => {
        if (!old) return old
        return old.map((t) => (t.id === temp.id ? created : t))
      })
    } catch {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    }
  }

  const handleDelete = async (id: string) => {
    addOptimistic({ type: "delete", id })
    try {
      await deleteTask(id)
      queryClient.setQueryData(["tasks"], (old: Task[] | undefined) => {
        if (!old) return old
        return old.filter((t) => t.id !== id)
      })
    } catch {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    }
  }

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return
    const trimmed = editTitle.trim()
    addOptimistic({ type: "update", task: { id: editingId, title: trimmed } as Task })
    setEditingId(null)
    try {
      await updateTask(editingId, { title: trimmed })
      queryClient.setQueryData(["tasks"], (old: Task[] | undefined) => {
        if (!old) return old
        return old.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t))
      })
    } catch {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    }
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1, #3730a3)" }}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Daily Momentum</p>
            <p className="text-white text-2xl font-black tracking-tighter">Task Mastery</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-tight mt-2">{completed} OF {total} TASKS COMPLETED</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center bg-white/5">
            <span className="text-white font-black text-sm">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-2">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="What needs to be done?"
          className="flex-1 ml-3 text-base text-gray-200 bg-transparent outline-none placeholder-gray-500" />
        <button onClick={handleAdd} disabled={!newTitle.trim()}
          className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-brand-blue/80 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <p className="text-lg font-bold text-gray-200">Your List</p>

      <div className="space-y-1">
        {optimistic.length === 0 && (
          <div className="card text-center py-12">
            <CheckCircle size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tasks yet. Add one to get started!</p>
          </div>
        )}
        {optimistic
          .sort((a, b) => Number(a.completed) - Number(b.completed))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((task) => {
            const isEditing = editingId === task.id
            return (
              <div key={task.id} onClick={() => !isEditing && handleToggle(task)}
                className={`card flex items-center gap-3 py-3 px-4 transition-all cursor-pointer ${task.completed ? "opacity-40" : ""}`}>
                <button onClick={(e) => { e.stopPropagation(); handleToggle(task) }}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${task.completed ? "bg-white border-white" : "border-white/20 bg-white/5"}`}>
                  {task.completed && <Check size={14} className="text-black" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        className="w-full text-base font-black text-white bg-transparent outline-none tracking-tighter" autoFocus />
                      <div className="flex justify-end gap-3 mt-1">
                        <button onClick={() => setEditingId(null)} className="text-white/30 hover:text-white/50"><X size={22} /></button>
                        <button onClick={saveEdit} className="text-white hover:text-brand-blue"><CheckCircle size={22} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`text-base font-black tracking-tighter ${task.completed ? "text-white/30 line-through" : "text-white"}`}>
                        {task.title.charAt(0).toUpperCase() + task.title.slice(1)}
                      </p>
                      {task.category !== "general" && (
                        <span className="inline-block bg-white/5 px-2 py-0.5 rounded-md mt-1 text-[9px] text-white/40 uppercase font-black tracking-widest">{task.category}</span>
                      )}
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(task.id); setEditTitle(task.title) }} className="text-white/20 hover:text-white/50 transition-colors p-1"><Edit3 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id) }} className="text-white/20 hover:text-red-400 transition-colors p-1"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

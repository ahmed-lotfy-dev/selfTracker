import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCollections } from "@/db/collections"
import { useState } from "react"
import { Plus } from "lucide-react"

export function LogWorkoutDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const collections = useCollections()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collections || !name.trim()) return

    try {
      await collections.workoutLogs.insert({
        id: crypto.randomUUID(),
        user_id: "local", // Will be replaced by sync with actual user ID if auth exists? Or backend handles it.
        // For local-first with sync, we usually set a temporary or actual ID.
        // Schema requires user_id. Guest mode uses "local" or similar.
        workout_name: name,
        notes: notes,
        workout_id: "manual", // or optional in schema? Schema says string. Let's provide a placeholder.
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setOpen(false)
      setName("")
      setNotes("")
    } catch (error) {
      console.error("Failed to log workout:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
          <DialogDescription>
            Record details about your training session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Upper Body Power"
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Felt strong, increased bench press..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>Save Log</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

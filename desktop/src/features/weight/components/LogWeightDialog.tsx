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
import { useCollections } from "@/db/collections"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LogWeightDialog() {
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState("")
  const [mood, setMood] = useState("neutral")
  const [energy, setEnergy] = useState("medium")
  const collections = useCollections()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collections || !weight) return

    try {
      await collections.weightLogs.insert({
        id: crypto.randomUUID(),
        user_id: "local",
        weight: weight, // Schema expects string? Yes based on previous review.
        mood: mood,
        energy: energy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setOpen(false)
      setWeight("")
      setMood("neutral")
      setEnergy("medium")
    } catch (error) {
      console.error("Failed to log weight:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Weight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Weight</DialogTitle>
          <DialogDescription>
            Track your body metrics and daily state.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75.0"
                className="col-span-3"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mood" className="text-right">
                Mood
              </Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="great">Great 😄</SelectItem>
                  <SelectItem value="good">Good 🙂</SelectItem>
                  <SelectItem value="neutral">Neutral 😐</SelectItem>
                  <SelectItem value="tired">Tired 😴</SelectItem>
                  <SelectItem value="bad">Bad 😫</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="energy" className="text-right">
                Energy
              </Label>
              <Select value={energy} onValueChange={setEnergy}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select energy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High ⚡</SelectItem>
                  <SelectItem value="medium">Medium 🔋</SelectItem>
                  <SelectItem value="low">Low 🪫</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!weight}>Save Log</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { DatePicker } from "@/components/ui/date-picker";
import { useWeightStore } from "@/stores/useWeightStore";
import { useUserStore } from "@/lib/user-store";

export function LogWeightDialog() {
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState("")
  const [mood, setMood] = useState("Medium")
  const [energy, setEnergy] = useState("Okay")
  const [date, setDate] = useState<Date | undefined>(new Date())

  const { addWeightLog } = useWeightStore()
  const userId = useUserStore(state => state.userId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight) return

    addWeightLog({
      userId: userId || 'local',
      weight,
      mood,
      energy,
      notes: null,
      createdAt: date?.toISOString() || new Date().toISOString(),
    })

    setOpen(false)
    setWeight("")
    setMood("Medium")
    setEnergy("Okay")
    setDate(new Date())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Weight
          <Kbd className="ml-2">Ctrl+A</Kbd>
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
                  <SelectItem value="High">High 😄</SelectItem>
                  <SelectItem value="Medium">Medium </SelectItem>
                  <SelectItem value="Low">Low </SelectItem>
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
                  <SelectItem value="Great">Great ⚡</SelectItem>
                  <SelectItem value="Good">Good 💪</SelectItem>
                  <SelectItem value="Okay">Okay 🔋</SelectItem>
                  <SelectItem value="Low">Low 🪫</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <DatePicker date={date} setDate={setDate} />
              </div>
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

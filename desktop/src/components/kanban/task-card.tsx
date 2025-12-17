import { Task } from "@/types/kanban"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Props {
  task: Task
}

export function TaskCard({ task }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium leading-tight">
            {task.title}
          </CardTitle>
          {task.priority && (
            <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-[10px] uppercase h-5 px-1">
              {task.priority}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2 text-xs text-muted-foreground">
        {task.description && <p className="line-clamp-2 mb-2">{task.description}</p>}
        {/* Date or other meta */}
      </CardContent>
    </Card>
  )
}

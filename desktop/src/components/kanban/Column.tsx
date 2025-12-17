import { Column, Task } from "@/types/kanban"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TaskCard } from "./task-card"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface Props {
  column: Column
  tasks: Task[]
}

export function KanbanColumn({ column, tasks }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-72 shrink-0 h-full max-h-full"
    >
      <Card className="h-full flex flex-col bg-muted/20 border-none shadow-none">
        <CardHeader className="p-3 border-b bg-card rounded-t-lg sticky top-0 z-10" {...attributes} {...listeners}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {column.name}
            </CardTitle>
            <span className="bg-muted text-xs font-mono px-2 py-0.5 rounded-full text-muted-foreground">
              {tasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-2 space-y-2 overflow-y-auto min-h-0 bg-muted/10">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}

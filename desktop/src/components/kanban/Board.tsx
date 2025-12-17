import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProjects } from "@/services/api/projects"
import { getTasks, updateTask } from "@/services/api/tasks"
import { Task } from "@/types/kanban"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, DragEndEvent, DragStartEvent, closestCorners } from "@dnd-kit/core"
import { createPortal } from "react-dom"
import { KanbanColumn } from "./Column"
import { TaskCard } from "./task-card"

interface Props {
  projectId?: string
}

export function Board({ projectId }: Props) {
  // Fetch projects to get columns definition
  // Ideally we should have getProject(id) to fetch single project + columns
  // But usage of getProjects is caching-friendly if we already loaded list.
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects
  })

  // Fetch ALL tasks? Or fetch tasks for project? 
  // Current API getTasks() returns ALL for user. 
  // Optimization: getTasks({ projectId }) if backend supports it.
  // Current backend tasks.ts: `getUserTasks(user.id)` -> gets all.
  // So client-side filtering is required.
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks
  })

  const queryClient = useQueryClient()

  const activeProject = useMemo(() => {
    if (!projectId) return projects?.[0]; // Default to first if no ID
    return projects?.find(p => p.id === projectId);
  }, [projectId, projects]);

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  )

  const moveTaskMutation = useMutation({
    mutationFn: (variables: { taskId: string, updates: Partial<Task> }) => updateTask(variables.taskId, variables.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    }
  })

  // Filter tasks for active project
  const projectTasks = useMemo(() => {
    if (!activeProject || !tasks) return []
    // Ensure tasks is array (backend returns json array directly)
    if (!Array.isArray(tasks)) return []
    return tasks.filter(t => t.projectId === activeProject.id)
  }, [activeProject, tasks])

  const columns = useMemo(() => activeProject?.columns || [], [activeProject])

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return;

    // Handling task move logic
    const isActiveTask = active.data.current?.type === "Task"
    const isOverColumn = over.data.current?.type === "Column"
    const isOverTask = over.data.current?.type === "Task"

    if (isActiveTask && (isOverColumn || isOverTask)) {
      // Find new column ID
      let newColumnId = "";
      if (isOverColumn) {
        newColumnId = overId;
      } else if (isOverTask) {
        // Find the column of the task we dropped over
        const overTask = tasks?.find((t: Task) => t.id === overId);
        if (overTask) newColumnId = overTask.columnId || "";
      }

      if (newColumnId && activeTask && activeTask.columnId !== newColumnId) {
        moveTaskMutation.mutate({ taskId: activeId, updates: { columnId: newColumnId } })
      }
    }
  }

  if (projectsLoading || tasksLoading) return <div>Loading board...</div>
  if (!activeProject) return <div>No project selected or found.</div>

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
        {/* added items-start to fix column stretch if not needed, or h-full if we want full height cols */}
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={projectTasks.filter(t => t.columnId === col.id).sort((a, b) => (a.order || 0) - (b.order || 0))}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}

import { useState, useMemo } from "react"
import { Task } from "@/types/kanban"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, DragEndEvent, DragStartEvent, closestCorners } from "@dnd-kit/core"
import { createPortal } from "react-dom"
import { KanbanColumn } from "./Column"
import { TaskCard } from "./task-card"
import { useCollections } from "@/db/collections"
import { useLiveQuery } from "@tanstack/react-db"

interface Props {
  projectId?: string
}

export function Board({ projectId }: Props) {
  const collections = useCollections();

  const { data: projects = [] } = useLiveQuery(
    (q: any) => q.from({ p: collections?.projects })
      .select(({ p }: any) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        isArchived: p.is_archived,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))
  ) || { data: [] };

  const { data: allTasks = [] } = useLiveQuery(
    (q: any) => q.from({ t: collections?.tasks })
      .select(({ t }: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        dueDate: t.due_date,
        completed: t.completed,
        projectId: t.project_id,
        columnId: t.column_id,
        order: t.order,
        userId: t.user_id,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        completedAt: t.completed_at
      }))
  ) as unknown as { data: Task[] } || { data: [] };

  const { data: allColumns = [] } = useLiveQuery(
    (q: any) => q.from({ c: collections?.projectColumns })
      .orderBy(({ c }: any) => c.order, 'ASC')
      .select(({ c }: any) => ({
        id: c.id,
        projectId: c.project_id,
        name: c.name,
        order: c.order,
        type: c.type
      }))
  ) as unknown as { data: any[] } || { data: [] };

  const activeProject = useMemo(() => {
    if (!projectId) return projects[0];
    return projects.find((p: any) => p.id === projectId);
  }, [projectId, projects]);

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  )

  // Filter tasks for active project
  const projectTasks = useMemo(() => {
    if (!activeProject || !allTasks) return []
    return allTasks.filter((t: any) => t.projectId === activeProject.id)
  }, [activeProject, allTasks])

  // Get columns for active project
  const columns = useMemo(() => {
    if (!activeProject || !allColumns) return [];
    return allColumns.filter((c: any) => c.projectId === activeProject.id);
  }, [activeProject, allColumns]);

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
        const overTask = allTasks.find((t: Task) => t.id === overId);
        if (overTask) newColumnId = overTask.columnId || "";
      }

      if (newColumnId && activeTask && activeTask.columnId !== newColumnId) {
        const targetColumn: any = columns.find((c: any) => c.id === newColumnId);

        const updates: any = { column_id: newColumnId };

        if (targetColumn?.type === "done") {
          updates.completed = true;
          updates.completed_at = new Date().toISOString();
        } else if (activeTask.completed) {
          updates.completed = false;
          updates.completed_at = null;
        }

        if (collections) {
          collections.tasks.update({
            where: { id: activeId },
            data: updates
          }).catch((e: any) => console.error("Failed to move task", e));
        }
      }
    }
  }

  if (!collections) return <div>Loading board...</div>
  if (!activeProject) return <div>No project selected or found.</div>

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
        {columns.map((col: any) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={projectTasks.filter((t: any) => t.columnId === col.id).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))}
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

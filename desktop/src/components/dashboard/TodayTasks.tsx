import { useCollections } from "@/db/collections";
import { useLiveQuery } from "@tanstack/react-db";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function TodayTasks() {
  const collections = useCollections();

  if (!collections) return <div className="py-8 text-center text-sm text-muted-foreground">Loading tasks...</div>;

  return <TodayTasksList collections={collections} />;
}

function TodayTasksList({ collections }: { collections: any }) {
  const { data: tasks = [] } = useLiveQuery(
    (q: any) => {
      // Simple filter: Not completed OR completed today
      // In a real app we'd filter for "due today" or similar, 
      // but for "Today's Focus" showing all active tasks is a good start.
      // We can refine this to "pinned" or "today" later.
      return q.from({ tasks: collections.tasks })
        // IMPORTANT: Filter must be applied BEFORE orderBy for correct query generation
        .filter(({ tasks }: any) => {
          // For now, show uncompleted tasks. 
          // Ideally we filter by date, but keeping it simple first.
          return tasks.completed.eq(false)
        })
        .orderBy(({ tasks }: any) => tasks.created_at, 'DESC')
        .select(({ tasks }: any) => ({
          id: tasks.id,
          title: tasks.title,
          completed: tasks.completed,
          completed_at: tasks.completed_at
        }))
    }
  ) || { data: [] };

  const toggleTask = async (task: any) => {
    try {
      await collections.tasks.update({
        where: { id: task.id },
        data: {
          completed: !task.completed,
          completed_at: !task.completed ? new Date().toISOString() : null
        }
      });
    } catch (e) {
      console.error("Failed to toggle task", e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Today's Focus</h3>
        <span className="text-xs text-muted-foreground">{tasks.length} pending</span>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <p>No tasks remaining. Enjoy your day!</p>
          </div>
        ) : (
          tasks.map((task: any) => (
            <div
              key={task.id}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-lg border bg-card transition-all hover:shadow-sm cursor-pointer",
                task.completed && "opacity-50"
              )}
              onClick={() => toggleTask(task)}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
              <span className={cn(
                "flex-1 font-medium text-sm transition-all",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

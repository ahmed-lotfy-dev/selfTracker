import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasksStore } from "@/stores/tasks-store";

export function TodayTasks() {
  const { tasks, updateTask } = useTasksStore();

  // Filter for uncompleted tasks
  const pendingTasks = tasks.filter(t => !t.completed);

  const toggleTask = (task: any) => {
    updateTask(task.id, {
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Today's Focus</h3>
        <span className="text-xs text-muted-foreground">{pendingTasks.length} pending</span>
      </div>

      <div className="space-y-2">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <p>No tasks remaining. Enjoy your day!</p>
          </div>
        ) : (
          pendingTasks.map((task) => (
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

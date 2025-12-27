import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTasksStore, useActiveTasks } from "@/stores/useTasksStore";
import { Kbd } from "@/components/ui/kbd";
import { useUserStore } from "@/lib/user-store";

export default function TasksPage() {
  return <TasksList />;
}

function TasksList() {
  const tasks = useActiveTasks();
  const { addTask, toggleComplete } = useTasksStore();
  const userId = useUserStore(state => state.userId);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreate = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!newTaskTitle.trim()) {
      return;
    }

    addTask({
      title: newTaskTitle,
      priority: "medium",
      userId: userId || 'local',
      category: 'general',
      completed: false,
      description: null,
      dueDate: null,
      projectId: null,
      columnId: null,
      order: 0,
      completedAt: null
    });

    setIsOpen(false);
    setNewTaskTitle("");
  };

  const toggleTask = (taskId: string) => {
    toggleComplete(taskId);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage all your tasks in one place.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
              <Kbd className="ml-2">Ctrl+A</Kbd>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
              />
              <Button type="submit">
                Add Task
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:bg-accent/20 transition-colors cursor-pointer" onClick={() => toggleTask(task.id)}>
            <CardContent className="p-4 flex items-center gap-4">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
              </div>
              {task.priority && (
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                  {task.priority}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
            <ListTodo className="h-10 w-10 opacity-50" />
            No tasks found. Get things done!
          </div>
        )}
      </div>
    </div>
  );
}

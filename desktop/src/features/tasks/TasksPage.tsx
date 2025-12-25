import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCollections } from "@/db/collections";
import { useLiveQuery } from "@tanstack/react-db";

export default function TasksPage() {
  const collections = useCollections();

  if (!collections) return <div className="p-8">Initializing database...</div>;

  return <TasksList collections={collections} />;
}

function TasksList({ collections }: { collections: any }) {
  const { data: tasks = [] } = useLiveQuery(
    (q: any) => q.from({ tasks: collections.tasks })
      .orderBy(({ tasks }: any) => tasks.created_at, 'DESC')
      .select(({ tasks }: any) => ({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        completed: tasks.completed,
        priority: tasks.priority,
        created_at: tasks.created_at,
        updated_at: tasks.updated_at
      }))
  ) || { data: [] };

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await collections.tasks.insert({
        title: newTaskTitle,
        priority: "medium",
        user_id: "local",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setIsOpen(false);
      setNewTaskTitle("");
    } catch (e) {
      console.error("Failed to create task", e);
    }
  }

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
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate}>
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.map((task: any) => (
          <Card key={task.id} className="hover:bg-accent/20 transition-colors cursor-pointer" onClick={() => toggleTask(task)}>
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

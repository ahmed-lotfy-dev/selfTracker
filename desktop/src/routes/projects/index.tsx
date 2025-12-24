import { Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCollections } from "@/db/collections";
import { useLiveQuery } from "@tanstack/react-db";

export default function ProjectsPage() {
  const collections = useCollections();

  const { data: projects = [] } = useLiveQuery(
    (q: any) => q.from({ p: collections?.projects })
      .orderBy(({ p }: any) => p.created_at, 'DESC')
      .select(({ p }: any) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        createdAt: p.created_at,
        // Columns relationship? 
        // We aren't joining columns here in mobile app usually.
        // We can just show bare project info or specific query for columns count if needed.
        // For now let's omit columns count or do a separate query if performance allows.
        // Or assume columns are not critically needed for the list view summary.
        // Mobile version shows simple list.
      }))
  ) as unknown as { data: any[] } || { data: [] };

  const [newProjectName, setNewProjectName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    if (!newProjectName.trim() || !collections) return;

    try {
      await collections.projects.insert({
        name: newProjectName,
        color: '#6366f1', // default indigo
        is_archived: false,
        user_id: "local",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setIsOpen(false);
      setNewProjectName("");
    } catch (e) {
      console.error("Failed to create project", e);
    }
  };

  if (!collections) return <div className="p-8">Initializing database...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and tasks.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="col-span-3"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <Button onClick={handleCreate}>
              Create
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project: any) => (
          <Link
            key={project.id}
            to="/projects/$projectId"
            params={{ projectId: project.id }}
            className="block h-full"
          >
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer border-l-4" style={{ borderLeftColor: project.color }}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{new Date(project.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 
                  TODO: Add columns count if we want to query it.
                  For now removing to save complexity on list view. 
                */}
                <span className="text-sm text-muted-foreground">View Board</span>
              </CardContent>
            </Card>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No projects found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

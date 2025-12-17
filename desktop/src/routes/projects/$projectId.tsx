import { useParams } from "@tanstack/react-router";
import { Board } from "@/components/kanban/Board";

export default function ProjectDetailPage() {
  // @ts-ignore - Route types are inferred weirdly with manual setup
  const { projectId } = useParams({ strict: false });

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      {/* 
        Height calculation: 4rem is roughly header height. 
        Ideally AppShell provides a flex-grow content area. 
        For now, explicit height ensures scrollable board works.
      */}
      <Board projectId={projectId} />
    </div>
  );
}

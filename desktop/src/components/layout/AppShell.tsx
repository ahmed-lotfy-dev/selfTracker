import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Settings, Minimize2, LogOut, LogIn, Timer, Dumbbell, Scale, CalendarCheck, ListTodo } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function AppShell() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mainNavItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/tasks",
      label: "Tasks",
      icon: ListTodo,
    },
    {
      to: "/timers",
      label: "Timers",
      icon: Timer,
    },
  ];

  const lifeNavItems = [
    {
      to: "/workouts",
      label: "Workouts",
      icon: Dumbbell,
    },
    {
      to: "/weight",
      label: "Weight",
      icon: Scale,
    },
    {
      to: "/habits",
      label: "Habits",
      icon: CalendarCheck,
    },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    localStorage.removeItem("bearer_token");
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    navigate({ to: "/login" });
  };


  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-lg tracking-tight flex items-center gap-2 font-orbitron">
            <span className="bg-primary text-primary-foreground p-1 rounded">ST</span> SelfTracker
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {/* Main Workspace */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    {
                      "bg-accent text-accent-foreground": location.pathname === item.to
                    }
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Life Tracking */}
          <div className="space-y-1">
            <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Life Tracking
            </h4>
            {lifeNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    {
                      "bg-accent text-accent-foreground": location.pathname === item.to
                    }
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t space-y-1">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              location.pathname === "/settings" && "bg-accent text-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          {localStorage.getItem("bearer_token") ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-primary hover:bg-primary/10"
            >
              <LogIn className="h-4 w-4" />
              Log in (sync data)
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          {/* Page Title or Breadcrumb could go here */}
          <div className="text-sm text-muted-foreground font-medium capitalize">
            {location.pathname === "/" ? "Dashboard" : location.pathname.replace("/", "")}
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                const { getCurrentWindow } = await import("@tauri-apps/api/window");
                getCurrentWindow().hide();
              }}
              title="Minimize to Tray"
              className="h-8 w-8 hover:bg-muted"
            >
              <Minimize2 size={18} />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Settings, Minimize2, LogOut, Timer, Dumbbell, Scale, CalendarCheck, ListTodo, FolderKanban } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const mainNavItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/projects",
      label: "Projects",
      icon: FolderKanban,
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
    navigate({ to: "/login" });
  };

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const initDeepLink = async () => {
      try {
        const { onOpenUrl } = await import("@tauri-apps/plugin-deep-link");
        unlisten = await onOpenUrl((urls) => {
          console.log("Deep link received:", urls);
          for (const url of urls) {
            if (url.startsWith("selftracker://auth")) {
              // TODO: Hand off to Auth Handler
              console.log("Processing Auth Deep Link", url);
              // Check if there is a code or token?
              // For now just alert/log to confirm flow
            }
          }
        });
      } catch (error) {
        console.error("Deep Link Error:", error);
      }
    };

    initDeepLink();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-lg tracking-tight flex items-center gap-2">
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
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
              onClick={() => getCurrentWindow().hide()}
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

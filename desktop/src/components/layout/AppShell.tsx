import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Settings, LogOut, LogIn, Dumbbell, Scale, CalendarCheck, ListTodo, Apple, Bot, User, FileJson, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/lib/user-store";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function AppShell() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/weight", label: "Weight", icon: Scale },
    { to: "/workouts", label: "Workouts", icon: Dumbbell },
    { to: "/tasks", label: "Tasks", icon: ListTodo },
    { to: "/habits", label: "Habits", icon: CalendarCheck },
    { to: "/nutrition", label: "Nutrition", icon: Apple },
    { to: "/ai", label: "AI Coach", icon: Bot },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/data", label: "Data", icon: FileJson },
    { to: "/timers", label: "Timer", icon: Timer },
  ];

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("bearer_token");
      localStorage.removeItem("user_id");
      useUserStore.getState().logout();
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.clear();
      navigate({ to: "/login" });
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-lg tracking-tight flex items-center gap-2 font-orbitron">
            <span className="bg-primary text-primary-foreground p-1 rounded">ST</span> SelfTracker
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    { "bg-accent text-accent-foreground": isActive(item.to) }
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t space-y-1">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive("/settings") && "bg-accent text-accent-foreground"
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

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="text-sm text-muted-foreground font-medium capitalize">
            {navItems.find(i => isActive(i.to))?.label || location.pathname.replace("/", "") || "Dashboard"}
          </div>
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
              <Timer size={18} />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

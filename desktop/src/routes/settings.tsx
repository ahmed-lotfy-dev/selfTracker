import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Provider/ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sun, Moon, Monitor, Cloud, Database, Trash2, LogIn, UserPlus, Shield, RefreshCw } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { clearAllSampleData, hasSampleData, loadAllSampleData } from "@/lib/sample-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AppVersionInfo() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    import("@tauri-apps/api/app")
      .then(({ getVersion }) => getVersion())
      .then(setVersion)
      .catch(() => setVersion("1.1.0"));
  }, []);

  return <p>Version: {version} (Beta)</p>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const isAuthenticated = !!localStorage.getItem("bearer_token");
  const navigate = useNavigate();
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [resettingSampleData, setResettingSampleData] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUser = async () => {
        const { data } = await authClient.getSession();
        if (data?.user) {
          setUser(data.user);
        }
      }
      fetchUser();
    }
  }, [isAuthenticated]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application preferences and system settings.
        </p>
      </div>

      <div className="grid gap-6">

        {/* Account & Sync Section - For ALL Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Account & Sync
            </CardTitle>
            <CardDescription>
              {isAuthenticated
                ? "Manage your account and data synchronization."
                : "Sign in to backup and sync your data across devices."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <RefreshCw className="w-4 h-4" />
                    <span>Syncing with cloud</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const { confirm } = await import("@tauri-apps/plugin-dialog");
                      const shouldLogout = await confirm(
                        "Are you sure you want to sign out?",
                        { title: "Sign Out", kind: "warning" }
                      );
                      if (shouldLogout) {
                        await authClient.signOut();
                        localStorage.removeItem("bearer_token");
                        localStorage.removeItem("user_id");
                        toast.success("Signed out successfully");
                        window.location.href = "/";
                      }
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Shield className="w-10 h-10 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Using Local Storage</p>
                    <p className="text-sm text-muted-foreground">
                      Your data is stored on this device only
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Create an account to backup and sync your data across all your devices.
                    Your local data will be preserved and migrated.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => navigate({ to: "/register" })}
                      className="flex-1 gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </Button>
                    <Button
                      onClick={() => navigate({ to: "/login" })}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Log In
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your application data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasSampleData() && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <p className="font-medium">Sample Data Loaded</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You're using sample data to explore features. You can reset or clear it anytime.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setResettingSampleData(true);
                    try {
                      clearAllSampleData();
                      const result = loadAllSampleData();
                      toast.success(
                        `Sample data reset! Loaded ${result.tasksCount} tasks, ${result.habitsCount} habits, and more.`
                      );
                    } catch (error) {
                      toast.error("Failed to reset sample data");
                    } finally {
                      setResettingSampleData(false);
                    }
                  }}
                  disabled={resettingSampleData}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${resettingSampleData ? 'animate-spin' : ''}`} />
                  Reset Sample Data
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="destructive"
                onClick={() => setClearDataDialogOpen(true)}
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                This will permanently delete all your tasks, habits, weight logs, and workout logs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme Preference</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="w-full"
                >
                  <Sun className="h-4 w-4 mr-2" /> Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="w-full"
                >
                  <Moon className="h-4 w-4 mr-2" /> Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="w-full"
                >
                  <Monitor className="h-4 w-4 mr-2" /> System
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                Choose between light mode, dark mode, or follow your system settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Section */}
        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>Application system configurations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="minimize-tray">Minimize to Tray on Close</Label>
                <p className="text-sm text-muted-foreground">Prevent the application from quitting when clicking the close button.</p>
              </div>
              <Switch id="minimize-tray" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-start">Start on Boot</Label>
                <p className="text-sm text-muted-foreground">Launch SelfTracker automatically when you log in.</p>
              </div>
              <Switch id="auto-start" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <AppVersionInfo />
              <p>Build: desktop-linux-x64</p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    toast.info("Checking for updates...");
                    const { check } = await import("@tauri-apps/plugin-updater");
                    const { relaunch } = await import("@tauri-apps/plugin-process");
                    const update = await check();

                    if (update) {
                      toast.success(`Update found: ${update.version}`);
                      const { confirm } = await import("@tauri-apps/plugin-dialog");
                      const shouldUpdate = await confirm(`Update to ${update.version} is available!\n\nRelease notes: ${update.body}`, { title: "Update Available", kind: 'info' });

                      if (shouldUpdate) {
                        toast.info("Downloading and installing update...");
                        let downloaded = 0;

                        await update.downloadAndInstall((event) => {
                          switch (event.event) {
                            case 'Started':
                              toast.info(`Started downloading ${event.data.contentLength} bytes...`);
                              break;
                            case 'Progress':
                              downloaded += event.data.chunkLength;
                              break;
                            case 'Finished':
                              toast.success("Download finished!");
                              break;
                          }
                        });

                        toast.success("Update installed! Restarting...");
                        await relaunch();
                      }
                    } else {
                      toast.success("You are on the latest version.");
                    }
                  } catch (error: any) {
                    console.error(error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    toast.error(`Failed to check for updates: ${errorMessage}`);
                  }
                }}
              >
                Check for Updates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={clearDataDialogOpen} onOpenChange={setClearDataDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete all of your:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span>Tasks and completed history</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span>Habits and streaks</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span>Weight logs and charts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span>Workout logs and history</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearDataDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAllSampleData();
                setClearDataDialogOpen(false);
                toast.success("All data cleared successfully");
              }}
            >
              Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Provider/ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { confirm } from "@tauri-apps/plugin-dialog";
import { Sun, Moon, Monitor } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";

function AppVersionInfo() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return <p>Version: {version} (Beta)</p>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const isAuthenticated = !!localStorage.getItem("bearer_token");

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user specific data if needed, or get from session
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

        {/* Account Section - Only for Logged In Users */}
        {isAuthenticated && user && (
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline">Manage Profile</Button>
              </div>
            </CardContent>
          </Card>
        )}

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
    </div>
  );
}

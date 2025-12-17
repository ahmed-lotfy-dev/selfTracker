import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application preferences and system settings.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for the application interface.</p>
                </div>
                <Switch id="theme-mode" disabled checked={true} /> {/* Placeholder: Enabled by default/system */}
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
                <p>Version: 0.1.0 (Beta)</p>
                <p>Build: desktop-linux-x64</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm">Check for Updates</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("onboarding_complete", "true");
    navigate({ to: "/" });
  };

  const handleLogin = () => {
    localStorage.setItem("onboarding_complete", "true");
    navigate({ to: "/login" });
  }

  const handleRegister = () => {
    localStorage.setItem("onboarding_complete", "true");
    navigate({ to: "/register" });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            SelfTracker
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal dashboard for life optimization.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 text-left">
          <div className="flex gap-4">
            <div className="bg-primary/10 p-2 rounded-lg h-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
            </div>
            <div>
              <h3 className="font-semibold">Private & Local First</h3>
              <p className="text-sm text-muted-foreground">Your data is stored locally on this device by default. You have full ownership.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary/10 p-2 rounded-lg h-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
            </div>
            <div>
              <h3 className="font-semibold">Seamless Sync</h3>
              <p className="text-sm text-muted-foreground">Sign in anytime to backup your data and sync across all your devices.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Button onClick={handleRegister} size="lg" className="w-full text-base">
            Create Account
          </Button>
          <Button variant="outline" onClick={handleLogin} className="w-full">
            Log In
          </Button>
          <div className="pt-2">
            <Button variant="ghost" onClick={handleComplete} className="w-full text-muted-foreground hover:text-primary">
              Later (Continue as Guest)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

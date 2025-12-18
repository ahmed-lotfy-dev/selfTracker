import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem("onboarding_complete", "true");
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="max-w-md p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to SelfTracker</h1>
        <p className="text-muted-foreground">
          Your personal data is always saved locally to your application's database. You have full control and privacy.
        </p>
        <p className="text-muted-foreground">
          If you want to access your data across multiple devices, you can sign up for an account. This will securely sync your data to the cloud.
        </p>
        <Button onClick={handleComplete}>Get Started</Button>
      </div>
    </div>
  );
}

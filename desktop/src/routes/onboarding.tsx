import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { loadAllSampleData } from "@/lib/sample-data";
import { CheckCircle2, Shield, RefreshCw, Zap, TrendingUp, CheckSquare, Heart, Activity, Database, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingSample, setLoadingSample] = useState(false);
  const totalSteps = 4;

  const handleComplete = (withSampleData = false) => {
    if (withSampleData) {
      setLoadingSample(true);
      try {
        const result = loadAllSampleData();
        toast.success(
          `Sample data loaded! ${result.tasksCount} tasks, ${result.habitsCount} habits, and more.`
        );
      } catch (error) {
        console.error("Failed to load sample data:", error);
        toast.error("Failed to load sample data");
      } finally {
        setLoadingSample(false);
      }
    }

    localStorage.setItem("onboarding_complete", "true");
    navigate({ to: "/" });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressValue = (currentStep / totalSteps) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-background via-background to-muted/20 text-foreground p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <div className="animate-in fade-in zoom-in duration-500">
          {currentStep === 1 && <WelcomeStep onNext={handleNext} />}
          {currentStep === 2 && (
            <SampleDataStep
              onNext={handleNext}
              onBack={handleBack}
              onLoadSample={() => {
                setLoadingSample(true);
                setTimeout(() => {
                  setLoadingSample(false);
                  handleNext();
                }, 500);
              }}
              loading={loadingSample}
            />
          )}
          {currentStep === 3 && (
            <QuickTipsStep onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 4 && (
            <ReadyStep onComplete={handleComplete} onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Activity className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          SelfTracker
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Your personal dashboard for life optimization
        </p>
      </div>

      <div className="grid gap-4 text-left">
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardContent className="flex gap-4 p-4">
            <div className="bg-primary/10 p-3 rounded-lg h-fit">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Private & Offline First</h3>
              <p className="text-sm text-muted-foreground">
                Your data is stored locally on this device. You have full ownership and control.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardContent className="flex gap-4 p-4">
            <div className="bg-primary/10 p-3 rounded-lg h-fit">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Track Everything</h3>
              <p className="text-sm text-muted-foreground">
                Manage tasks, build habits, log workouts, track weight, and visualize your progress.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardContent className="flex gap-4 p-4">
            <div className="bg-primary/10 p-3 rounded-lg h-fit">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Optional Cloud Sync</h3>
              <p className="text-sm text-muted-foreground">
                Sign in anytime to backup your data and sync across all your devices.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={onNext} size="lg" className="w-full text-base gap-2">
        Get Started
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function SampleDataStep({
  onNext,
  onBack,
  onLoadSample,
  loading,
}: {
  onNext: () => void;
  onBack: () => void;
  onLoadSample: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">See it in action</h2>
        <p className="text-muted-foreground">
          We can add sample data so you can explore features right away
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <p className="font-medium text-sm">6 Sample Tasks</p>
            <p className="text-xs text-muted-foreground">With different priorities</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <Heart className="w-5 h-5 text-primary" />
            <p className="font-medium text-sm">5 Habits</p>
            <p className="text-xs text-muted-foreground">Daily tracking ready</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <p className="font-medium text-sm">30 Days Weight</p>
            <p className="text-xs text-muted-foreground">Shows chart trends</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <Activity className="w-5 h-5 text-primary" />
            <p className="font-medium text-sm">12 Workouts</p>
            <p className="text-xs text-muted-foreground">Varied activities</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={onLoadSample}
          size="lg"
          className="w-full gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading Sample Data...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Load Sample Data
              <Badge variant="secondary" className="ml-2">Recommended</Badge>
            </>
          )}
        </Button>

        <Button onClick={onNext} variant="outline" size="lg" className="w-full">
          Start Fresh
        </Button>

        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-3 h-3" />
          Back
        </Button>
      </div>
    </div>
  );
}

function QuickTipsStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Zap className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">Quick Tips</h2>
        <p className="text-muted-foreground">Get the most out of SelfTracker</p>
      </div>

      <div className="space-y-3">
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-4 flex gap-3 items-start">
            <div className="bg-primary/10 p-2 rounded-lg mt-0.5">
              <kbd className="text-xs font-mono font-semibold text-primary">Ctrl+A</kbd>
            </div>
            <div>
              <p className="font-medium">Quick Task Entry</p>
              <p className="text-sm text-muted-foreground">
                Use keyboard shortcuts to quickly add tasks from anywhere
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-4 flex gap-3 items-start">
            <div className="bg-primary/10 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Automatic Charts</p>
              <p className="text-sm text-muted-foreground">
                Your progress is visualized automatically as you log data
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-4 flex gap-3 items-start">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Auto-Save Everything</p>
              <p className="text-sm text-muted-foreground">
                Your data is saved automatically - no need to worry about losing progress
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-4 flex gap-3 items-start">
            <div className="bg-primary/10 p-2 rounded-lg">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Sync When Ready</p>
              <p className="text-sm text-muted-foreground">
                Head to Settings anytime to create an account and enable cloud sync
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onNext} size="lg" className="w-full gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-3 h-3" />
          Back
        </Button>
      </div>
    </div>
  );
}

function ReadyStep({
  onComplete,
  onBack,
}: {
  onComplete: (withSampleData: boolean) => void;
  onBack: () => void;
}) {
  const sampleDataLoaded = localStorage.getItem("sample_data_loaded") === "true";

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="bg-green-500/10 p-6 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </div>
        <h2 className="text-4xl font-bold">You're all set!</h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {sampleDataLoaded
            ? "Sample data has been loaded. Start exploring your dashboard!"
            : "Your personal tracking dashboard is ready to use."}
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 space-y-3">
          <Shield className="w-8 h-8 text-primary mx-auto" />
          <p className="text-sm font-medium">Remember: Your data is private</p>
          <p className="text-xs text-muted-foreground">
            Everything is stored locally on your device. You can enable cloud sync anytime from Settings.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => onComplete(sampleDataLoaded)}
          size="lg"
          className="w-full text-base gap-2"
        >
          Open SelfTracker
          <CheckCircle2 className="w-5 h-5" />
        </Button>

        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-3 h-3" />
          Back
        </Button>
      </div>
    </div>
  );
}

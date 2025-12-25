import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { HabitsWidget } from "@/components/dashboard/HabitsWidget"

export default function DashboardPage() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="max-w-5xl w-full mx-auto p-6 space-y-8">

        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
          <p className="text-muted-foreground">Here is your daily overview.</p>
        </div>

        {/* Quick Stats */}
        <DashboardStats />

        {/* Habits Row */}
        <HabitsWidget />

        {/* Tasks Section - TEMPORARILY DISABLED */}
        {/* <TodayTasks /> */}

        {/* Bottom Spacer */}
        <div className="h-10"></div>
      </div>
    </div>
  )
}

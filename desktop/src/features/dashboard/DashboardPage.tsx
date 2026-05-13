import { useQuery } from "@tanstack/react-query"
import { Scale, Dumbbell, ListTodo, Flame, Apple, Bot } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Link } from "@tanstack/react-router"
import { HabitsWidget } from "@/components/dashboard/HabitsWidget"
import { Button } from "@/components/ui/button"
import { getFoodLogs, getNutritionGoals } from "@/services/api/nutrition"
import { useWeightStore } from "@/stores/useWeightStore"
import { useWorkoutsStore } from "@/stores/useWorkoutsStore"
import { useActiveTasks } from "@/stores/useTasksStore"

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function DashboardPage() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const { weightLogs } = useWeightStore();
  const { workoutLogs } = useWorkoutsStore();
  const tasks = useActiveTasks();

  const sortedWeights = [...weightLogs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const todayLogsQ = useQuery({
    queryKey: ["foodLogs", today()],
    queryFn: () => getFoodLogs(today()),
  });

  const goalsQ = useQuery({
    queryKey: ["nutritionGoals"],
    queryFn: getNutritionGoals,
  });

  const meals = todayLogsQ.data ?? [];
  const goals = goalsQ.data;
  const totalCals = meals.reduce((s: number, m: any) => s + m.totalCalories, 0);
  const calGoal = goals?.dailyCalories ?? 2000;

  const currentWeight = sortedWeights[0]?.weight;
  const startWeight = sortedWeights[sortedWeights.length - 1]?.weight;
  const weightChange = currentWeight && startWeight ? (parseFloat(currentWeight) - parseFloat(startWeight)).toFixed(1) : null;

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedToday = tasks.filter(t => t.completed &&
    new Date(t.completedAt || t.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const pieData = [
    { name: 'Done', value: completedToday },
    { name: 'Pending', value: pendingTasks },
  ];
  const COLORS = ['#10B981', '#3B82F6'];

  const quickActions = [
    { to: "/weight", label: "Weight", icon: Scale, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { to: "/workouts", label: "Workout", icon: Dumbbell, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { to: "/tasks", label: "Task", icon: ListTodo, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { to: "/habits", label: "Habits", icon: Flame, color: "bg-red-500/10 text-red-500 border-red-500/20" },
    { to: "/nutrition", label: "Food", icon: Apple, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="max-w-5xl w-full mx-auto p-6 space-y-6">

        {/* Header + AI FAB */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
            <p className="text-muted-foreground">Here is your daily overview.</p>
          </div>
          <Link to="/ai">
            <Button className="rounded-full gap-2">
              <Bot className="h-4 w-4" />
              AI Coach
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${action.color} min-w-[90px] hover:scale-105 transition-transform`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-[#0EA5E9]" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Weight</span>
            </div>
            <p className="text-2xl font-bold">{currentWeight || '-'} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
            <p className="text-xs text-muted-foreground mt-1">
              {weightChange ? `${weightChange.startsWith('-') ? '' : '+'}${weightChange} kg total` : 'No data'}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-4 w-4 text-[#A855F7]" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Workouts</span>
            </div>
            <p className="text-2xl font-bold">{workoutLogs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total sessions</p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <ListTodo className="h-4 w-4 text-[#F59E0B]" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Tasks</span>
            </div>
            <p className="text-2xl font-bold">{pendingTasks}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Apple className="h-4 w-4 text-[#10B981]" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Calories</span>
            </div>
            <p className="text-2xl font-bold">{totalCals}</p>
            <p className="text-xs text-muted-foreground mt-1">/ {calGoal} goal</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weight Trend */}
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Weight Trend</h2>
            {sortedWeights.length > 1 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={[...sortedWeights].reverse().slice(-30).map(w => ({
                  date: w.createdAt?.slice(0, 10),
                  weight: parseFloat(w.weight)
                }))}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--foreground))' }} />
                  <Area type="monotone" dataKey="weight" stroke="#0EA5E9" fill="url(#wg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                Not enough data yet
              </div>
            )}
          </div>

          {/* Tasks Pie Chart */}
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tasks Overview</h2>
            {tasks.length > 0 ? (
              <div className="flex items-center justify-center h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No tasks yet
              </div>
            )}
          </div>
        </div>

        {/* Habits Widget */}
        <HabitsWidget />

        {/* Bottom Spacer */}
        <div className="h-10"></div>
      </div>
    </div>
  )
}

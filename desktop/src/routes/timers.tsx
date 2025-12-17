import { PomodoroTimer } from "@/components/timer/PomodoroTimer";

export default function TimersPage() {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-8">Focus Timer</h1>
      <PomodoroTimer />
    </div>
  );
}

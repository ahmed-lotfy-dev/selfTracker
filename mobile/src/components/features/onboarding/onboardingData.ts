export interface OnboardingStep {
  id: string
  image: any
  title: string
  description: string
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "1",
    image: require("@/assets/images/onboarding/home-page.png"),
    title: "Your Personal\nDashboard",
    description:
      "Get a bird's-eye view of your fitness journey. Track workouts, monitor weight trends, and manage daily tasks all in one beautiful place.",
  },
  {
    id: "2",
    image: require("@/assets/images/onboarding/weight-logs.png"),
    title: "Track Every\nMilestone",
    description:
      "Visualize your progress with intuitive charts. Log your weight daily and watch your transformation unfold over time.",
  },
  {
    id: "3",
    image: require("@/assets/images/onboarding/workout-logs.png"),
    title: "Log Your\nWorkouts",
    description:
      "Keep a detailed history of every session. Analyze your performance and stay consistent with easy-to-read monthly logs.",
  },
  {
    id: "4",
    image: require("@/assets/images/onboarding/workouts-calendarview.png"),
    title: "Consistency\nis Key",
    description:
      "View your workout streaks on a dedicated calendar. Seeing your active days motivates you to never break the chain.",
  },
  {
    id: "5",
    image: require("@/assets/images/onboarding/tasks.png"),
    title: "Achieve\nYour Goals",
    description:
      "Break down big goals into manageable daily tasks. Stay organized and focused on what truly matters for your growth.",
  },
]

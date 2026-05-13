import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

import { AppShell } from "@/components/layout/AppShell";
import { TimerController } from "@/components/timer/TimerController";
import { AppUpdater } from "@/components/updater/AppUpdater";
import { useDeepLinkHandler } from "@/hooks/useDeepLinkHandler";
import { AppProviders } from "@/components/Provider/AppProviders";

import { DataSyncReminder } from "@/components/ui/DataSyncReminder";
import { ThemeProvider } from "@/components/Provider/ThemeProvider";
import DashboardPage from "@/features/dashboard/DashboardPage";
import LoginPage from "./routes/login";
import RegisterPage from "./routes/register";
import SettingsPage from "./routes/settings";
import WorkoutsPage from "./routes/workouts";
import WeightPage from "./routes/weight";
import HabitsPage from "./routes/habits";
import TasksPage from "./routes/tasks";
import TimersPage from "./routes/timers";
import TimerOverlayPage from "./routes/timer-overlay";
import OnboardingPage from "./routes/onboarding";
import NutritionPage from "./routes/nutrition";
import NutritionAddPage from "./routes/nutrition-add";
import NutritionGoalsPage from "./routes/nutrition-goals";
import AIPage from "./routes/ai";
import ProfilePage from "./routes/profile";
import DataPage from "./routes/data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DebugConsole } from "@/components/DebugConsole";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

function RootLayout() {
  useDeepLinkHandler();

  if (window.location.pathname === '/timer-overlay') {
    return (
      <>
        <TimerController />
        <Outlet />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AppUpdater />
      <TimerController />
      <DataSyncReminder />
      <Outlet />
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  beforeLoad: ({ location }) => {
    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (!onboardingComplete && location.pathname !== '/onboarding' && location.pathname !== '/timer-overlay') {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: RootLayout,
});

const shellRoute = createRoute({
  id: 'shell',
  getParentRoute: () => rootRoute,
  component: () => <AppShell />,
});

const indexRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/",
  component: DashboardPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/settings",
  component: SettingsPage,
});

const workoutsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/workouts",
  component: WorkoutsPage,
});

const weightRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/weight",
  component: WeightPage,
});

const habitsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/habits",
  component: HabitsPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/tasks",
  component: TasksPage,
});

const timersRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/timers",
  component: TimersPage,
});

const nutritionRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/nutrition",
  component: NutritionPage,
});

const nutritionAddRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/nutrition-add",
  component: NutritionAddPage,
});

const nutritionGoalsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/nutrition-goals",
  component: NutritionGoalsPage,
});

const aiRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/ai",
  component: AIPage,
});

const profileRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/profile",
  component: ProfilePage,
});

const dataRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/data",
  component: DataPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const overlayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/timer-overlay",
  component: TimerOverlayPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([
    indexRoute,
    settingsRoute,
    workoutsRoute,
    weightRoute,
    habitsRoute,
    tasksRoute,
    timersRoute,
    nutritionRoute,
    nutritionAddRoute,
    nutritionGoalsRoute,
    aiRoute,
    profileRoute,
    dataRoute,
  ]),
  loginRoute,
  registerRoute,
  overlayRoute,
  onboardingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const isOverlay = window.location.pathname === '/timer-overlay';

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <DebugConsole />
        <ErrorBoundary>
          {isOverlay ? (
            <RouterProvider router={router} />
          ) : (
            <AppProviders>
              <RouterProvider router={router} />
            </AppProviders>
          )}
        </ErrorBoundary>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}

export default App;

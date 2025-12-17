import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from "@tanstack/react-router";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

import { AppShell } from "@/components/layout/AppShell";
import { TimerController } from "@/components/timer/TimerController";

// Pages
import DashboardPage from "./routes/dashboard";
import LoginPage from "./routes/login";
import RegisterPage from "./routes/register";
import SettingsPage from "./routes/settings";
import WorkoutsPage from "./routes/workouts";
import WeightPage from "./routes/weight";
import HabitsPage from "./routes/habits";
import TasksPage from "./routes/tasks";
import TimersPage from "./routes/timers";
import TimerOverlayPage from "./routes/timer-overlay";

// Create a client with persistence settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes (adjust as needed)
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

// 1. Root Route (Global Providers & Logic)
const rootRoute = createRootRoute({
  component: () => (
    <>
      <TimerController /> {/* Global Timer Logic runs everywhere */}
      <Outlet />
      <Toaster />
    </>
  ),
});

// 2. App Shell Route (Sidebar Layout)
const shellRoute = createRoute({
  id: 'shell',
  getParentRoute: () => rootRoute,
  component: AppShell,
});

// --- Routes inside App Shell ---

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

// --- Standalone Routes (No Sidebar) ---

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

import ProjectsPage from "./routes/projects/index";
import ProjectDetailPage from "./routes/projects/$projectId";

const projectsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/projects",
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/projects/$projectId",
  component: ProjectDetailPage,
});

// 3. Register Route Tree
const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([
    indexRoute,
    settingsRoute,
    workoutsRoute,
    weightRoute,
    habitsRoute,
    tasksRoute,
    timersRoute,
    projectsRoute,
    projectDetailRoute
  ]),
  loginRoute,
  registerRoute,
  overlayRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <RouterProvider router={router} />
    </PersistQueryClientProvider>
  );
}

export default App;

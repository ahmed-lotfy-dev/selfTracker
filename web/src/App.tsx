import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./stores/authStore"
import ProtectedLayout from "./components/ProtectedLayout"
import Dashboard from "./pages/Dashboard"
import WeightsPage from "./pages/WeightsPage"
import AddWeight from "./pages/weights/AddWeight"
import EditWeight from "./pages/weights/EditWeight"
import WorkoutsPage from "./pages/WorkoutsPage"
import AddWorkout from "./pages/workouts/AddWorkout"
import EditWorkout from "./pages/workouts/EditWorkout"
import TasksPage from "./pages/TasksPage"
import HabitsPage from "./pages/HabitsPage"
import AddHabit from "./pages/habits/AddHabit"
import NutritionPage from "./pages/NutritionPage"
import NutritionGoals from "./pages/NutritionGoals"
import NutritionAdd from "./pages/NutritionAdd"
import AIPage from "./pages/AIPage"
import ProfilePage from "./pages/ProfilePage"
import DataPage from "./pages/DataPage"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  if (!hasHydrated) return null
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.user)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  if (!hasHydrated) return null
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/sign-up" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/" element={<RequireAuth><ProtectedLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="weights" element={<WeightsPage />} />
        <Route path="weights/add" element={<AddWeight />} />
        <Route path="weights/:id/edit" element={<EditWeight />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="workouts/add" element={<AddWorkout />} />
        <Route path="workouts/:id/edit" element={<EditWorkout />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="habits/add" element={<AddHabit />} />
        <Route path="nutrition" element={<NutritionPage />} />
        <Route path="nutrition/add" element={<NutritionAdd />} />
        <Route path="nutrition/goals" element={<NutritionGoals />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="data" element={<DataPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

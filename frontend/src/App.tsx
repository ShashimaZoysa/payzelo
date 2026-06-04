import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"
import DashboardLayout from "@/layouts/DashboardLayout"
import { useAuthStore } from "@/store/auth.store"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div>
                  <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Dashboard</h1>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Welcome back</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
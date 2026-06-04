import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  CreditCard,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react"
import { useAuthStore } from "@/store/auth.store"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Customers", icon: Users, path: "/customers" },
  { label: "Quotations", icon: FileText, path: "/quotations" },
  { label: "Invoices", icon: Receipt, path: "/invoices" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, business, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 w-60 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--sidebar)", borderRight: "0.5px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>PayZelo</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Business info */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-lg" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Building2 size={14} style={{ color: "var(--primary-light)" }} />
            <span className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>{business?.name}</span>
          </div>
          <span className="text-xs mt-1 block" style={{ color: business?.status === "TRIAL" ? "var(--warning)" : "var(--success)" }}>
            {business?.status === "TRIAL" ? "Trial" : "Pro"}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: active ? "rgba(99,179,237,0.1)" : "transparent",
                  color: active ? "var(--primary-light)" : "var(--text-muted)",
                }}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info and logout */}
        <div className="px-3 py-4" style={{ borderTop: "0.5px solid var(--border)" }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: "var(--primary)", color: "white" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-all hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4" style={{ background: "var(--background)", borderBottom: "0.5px solid var(--border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ color: "var(--text-muted)" }}>
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
            {navItems.find((i) => i.path === location.pathname)?.label || "Dashboard"}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
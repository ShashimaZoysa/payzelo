import { useAuthStore } from "@/store/auth.store"

export default function Dashboard() {
  const { user, business } = useAuthStore()

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {business?.name}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Total Outstanding</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--text)" }}>Rs. 0</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>0 invoices unpaid</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Overdue</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--danger)" }}>Rs. 0</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>0 invoices overdue</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Collected This Month</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--success)" }}>Rs. 0</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>0 payments received</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Total Customers</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--text)" }}>0</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>0 active</p>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Recent Invoices</h2>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No invoices yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Create your first invoice to get started</p>
        </div>
      </div>

    </div>
  )
}
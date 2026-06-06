import { useEffect, useState } from "react"
import { Plus, Search, Phone, Mail, MapPin } from "lucide-react"
import type { Customer, CreateCustomerInput } from "@/types"
import { getCustomersApi, createCustomerApi, updateCustomerApi, deleteCustomerApi } from "@/api/customer"

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState<CreateCustomerInput>({ name: "", email: "", phone: "", address: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await getCustomersApi()
      setCustomers(data)
    } catch {
      console.error("Failed to fetch customers")
    } finally {
      setLoading(false)
    }
  }

  const openAddForm = () => {
    setEditingCustomer(null)
    setForm({ name: "", email: "", phone: "", address: "" })
    setError("")
    setShowForm(true)
  }

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer)
    setForm({ name: customer.name, email: customer.email || "", phone: customer.phone || "", address: customer.address || "" })
    setError("")
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // validate sri lankan phone number
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) {
      setError("Phone number must be 10 digits starting with 0")
      return
    }

    setSaving(true)

    try {
      if (editingCustomer) {
        const updated = await updateCustomerApi(editingCustomer.id, form)
        setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        const created = await createCustomerApi(form)
        setCustomers([created, ...customers])
      }
      setShowForm(false)
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Delete ${customer.name}?`)) return

    try {
      await deleteCustomerApi(customer.id)
      setCustomers(customers.filter((c) => c.id !== customer.id))
    } catch {
      alert("Failed to delete customer")
    }
  }

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const riskColor = {
    GREEN: "var(--success)",
    YELLOW: "var(--warning)",
    RED: "var(--danger)",
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Customers</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{customers.length} total</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--primary)", color: "white" }}
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
          style={{ background: "var(--surface)", border: "0.5px solid var(--border)", color: "var(--text)" }}
        />
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No customers found</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Add your first customer to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((customer) => (
            <div key={customer.id} className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ background: "var(--primary)", color: "white" }}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{customer.name}</p>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: riskColor[customer.riskScore] }} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {customer.phone && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <Phone size={11} />{customer.phone}
                      </span>
                    )}
                    {customer.email && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <Mail size={11} />{customer.email}
                      </span>
                    )}
                    {customer.address && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <MapPin size={11} />{customer.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEditForm(customer)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text-muted)" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(customer)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: "rgba(245,101,101,0.1)", color: "var(--danger)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text)" }}>
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>

            {error && (
              <div className="text-sm px-4 py-3 rounded-lg mb-4" style={{ background: "rgba(245,101,101,0.1)", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Customer name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
                  placeholder="e.g. Amal Silva"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Phone number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
                  placeholder="e.g. 0712345678"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
                  placeholder="e.g. No.5, Kandy Rd"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--primary)", color: "white", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Saving..." : editingCustomer ? "Save changes" : "Add customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
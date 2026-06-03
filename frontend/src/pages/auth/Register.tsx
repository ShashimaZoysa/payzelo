import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { registerApi } from "@/api/auth"
import { useAuthStore } from "@/store/auth.store"

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [form, setForm] = useState({
    businessName: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
    { label: "At least one symbol (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
  ]

  const validatePassword = (password: string) => {
    for (const rule of passwordRules) {
      if (!rule.test(password)) return rule.label + " is required"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const passwordError = validatePassword(form.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const res = await registerApi(form)
      setAuth(res.user, res.business, res.token)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "var(--surface)", border: "0.5px solid var(--border)" }}>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text)" }}>PayZelo</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Start your 14-day free trial. No credit card required.</p>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 rounded-lg mb-4" style={{ background: "rgba(245,101,101,0.1)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Business name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
              placeholder="e.g. Acme Traders"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Owner's name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
              placeholder="e.g. John Smith"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 pr-10"
                style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
                placeholder="e.g. MyP@ss123"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordRules.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-2">
                    {rule.test(form.password)
                      ? <Check size={12} style={{ color: "var(--success)" }} />
                      : <X size={12} style={{ color: "var(--danger)" }} />
                    }
                    <span className="text-xs" style={{ color: rule.test(form.password) ? "var(--success)" : "var(--text-muted)" }}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Confirm password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 pr-10"
                style={{ background: "var(--background)", border: "0.5px solid var(--border)", color: "var(--text)" }}
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "var(--primary)", color: "white", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--primary-light)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
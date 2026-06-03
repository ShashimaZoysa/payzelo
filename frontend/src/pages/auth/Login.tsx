import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { loginApi } from "@/api/auth"
import { useAuthStore } from "@/store/auth.store"

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await loginApi(form)
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
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sign in to your account</p>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 rounded-lg mb-4" style={{ background: "rgba(245,101,101,0.1)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
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
                placeholder="••••••••"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium hover:underline" style={{ color: "var(--primary-light)" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
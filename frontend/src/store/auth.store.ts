import { create } from "zustand"
import type { User, Business } from "../types"

interface AuthState {
  user: User | null
  business: Business | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, business: Business | null, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  business: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, business, token) => {
    localStorage.setItem("token", token)
    set({ user, business, token, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem("token")
    set({ user: null, business: null, token: null, isAuthenticated: false })
  },
}))
export interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "OWNER" | "STAFF"
}

export interface Business {
  id: string
  name: string
  status: "TRIAL" | "ACTIVE" | "SUSPENDED"
  trialEndsAt: string | null
}

export interface AuthResponse {
  message: string
  token: string
  user: User
  business: Business | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  businessName: string
  name: string
  email: string
  password: string
}

export interface Customer {
  id: string
  businessId: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  riskScore: "GREEN" | "YELLOW" | "RED"
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerInput {
  name: string
  email?: string
  phone?: string
  address?: string
}
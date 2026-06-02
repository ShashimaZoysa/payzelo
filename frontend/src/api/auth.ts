import api from "./axios"
import type { AuthResponse, LoginInput, RegisterInput } from "../types"

export const registerApi = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await api.post("/auth/register", data)
  return response.data
}

export const loginApi = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data)
  return response.data
}

export const meApi = async (): Promise<AuthResponse> => {
  const response = await api.get("/auth/me")
  return response.data
}
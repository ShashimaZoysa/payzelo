import api from "./axios"
import type { Customer, CreateCustomerInput } from "../types"

export const getCustomersApi = async (): Promise<Customer[]> => {
  const response = await api.get("/customers")
  return response.data.customers
}

export const getCustomerApi = async (id: string): Promise<Customer> => {
  const response = await api.get(`/customers/${id}`)
  return response.data.customer
}

export const createCustomerApi = async (data: CreateCustomerInput): Promise<Customer> => {
  const response = await api.post("/customers", data)
  return response.data.customer
}

export const updateCustomerApi = async (id: string, data: CreateCustomerInput): Promise<Customer> => {
  const response = await api.put(`/customers/${id}`, data)
  return response.data.customer
}

export const deleteCustomerApi = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`)
}
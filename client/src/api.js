// "service layer" — separates data-fetching from UI logic.

import axios from "axios";

// axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Interceptor: auto-attach token to every request. This runs before EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finflow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const register = (data) => api.post("/api/auth/register", data);
export const login = (data) => api.post("/api/auth/login", data);
export const getMe = () => api.get("/api/auth/me");
export const updateProfile = (data) => api.patch("/api/auth/profile", data);

// TRANSACTIONS
export const getTransactions = (params) =>
  api.get("/api/transactions", { params });
export const createTransaction = (data) => api.post("/api/transactions", data);
export const updateTransaction = (id, data) =>
  api.put(`/api/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`);
export const getSummary = (params) =>
  api.get("/api/transactions/summary", { params });

// BUDGETS
export const getBudgets = (params) => api.get("/api/budgets", { params });
export const setBudget = (data) => api.post("/api/budgets", data);
export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`);

export default api;

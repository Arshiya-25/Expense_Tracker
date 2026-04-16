// src/api.js — ALL YOUR API CALLS IN ONE PLACE
// Why? If your backend URL changes, you change it here once, not in 10 files.
// This pattern is called a "service layer" — separates data-fetching from UI logic.

import axios from "axios";

// axios instance with base URL
// In dev, Vite proxy sends /api → localhost:5000
// In prod, set VITE_API_URL to your Render URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Interceptor: auto-attach token to every request
// This runs before EVERY request — so you never manually add the header
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
export const getTransactions = (params) => api.get("/api/transactions", { params });
export const createTransaction = (data) => api.post("/api/transactions", data);
export const updateTransaction = (id, data) => api.put(`/api/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`);
export const getSummary = (params) => api.get("/api/transactions/summary", { params });

// BUDGETS
export const getBudgets = (params) => api.get("/api/budgets", { params });
export const setBudget = (data) => api.post("/api/budgets", data);
export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`);

export default api;

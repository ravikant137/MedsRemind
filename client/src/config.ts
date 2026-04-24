// src/config.ts
// Centralized API URL configuration for both local dev and production
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

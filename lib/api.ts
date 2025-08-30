import axios from "axios";
import { config } from "./config";
import { getSession } from "next-auth/react";

// Create axios instance with default config
export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Try to get the session on client side
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // NextAuth will handle token refresh automatically
      // Just retry the request
      const session = await getSession();
      if (session?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return api(originalRequest);
      }

      // If no session, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);
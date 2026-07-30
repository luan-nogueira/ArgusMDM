import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { TokenResponse } from "@/types";
import { tokenStorage } from "@/lib/token-storage";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<TokenResponse>(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refreshToken },
    );
    const { accessToken, refreshToken: newRefreshToken, user } = response.data;
    tokenStorage.setSession(accessToken, newRefreshToken, user);
    return accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login")
      || originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      tokenStorage.clear();
      onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);

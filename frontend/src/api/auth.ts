import { apiClient } from "@/lib/api-client";
import type { Enable2FAResponse, LoginRequest, TokenResponse, UserResponse } from "@/types";

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<TokenResponse>("/auth/login", payload).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refreshToken }).then((r) => r.data),

  me: () => apiClient.get<UserResponse>("/auth/me").then((r) => r.data),

  enable2FA: () => apiClient.post<Enable2FAResponse>("/auth/2fa/enable").then((r) => r.data),

  confirm2FA: (code: string) => apiClient.post("/auth/2fa/confirm", { code }).then((r) => r.data),

  disable2FA: () => apiClient.post("/auth/2fa/disable").then((r) => r.data),
};

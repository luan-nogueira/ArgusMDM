import type { UserResponse } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface Enable2FAResponse {
  secret: string;
  qrCodeImageBase64: string;
}

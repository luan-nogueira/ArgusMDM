import type { UserRole } from "./enums";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  twoFaEnabled: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name: string;
  role: UserRole;
  active: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

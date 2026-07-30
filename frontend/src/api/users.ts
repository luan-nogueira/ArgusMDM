import { apiClient } from "@/lib/api-client";
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  PageResponse,
  UpdateUserRequest,
  UserResponse,
} from "@/types";

export const usersApi = {
  list: (page = 0, size = 20) =>
    apiClient
      .get<PageResponse<UserResponse>>("/users", { params: { page, size } })
      .then((r) => r.data),

  get: (id: string) => apiClient.get<UserResponse>(`/users/${id}`).then((r) => r.data),

  create: (payload: CreateUserRequest) =>
    apiClient.post<UserResponse>("/users", payload).then((r) => r.data),

  update: (id: string, payload: UpdateUserRequest) =>
    apiClient.put<UserResponse>(`/users/${id}`, payload).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/users/${id}`).then((r) => r.data),

  changePassword: (payload: ChangePasswordRequest) =>
    apiClient.put("/users/me/password", payload).then((r) => r.data),
};

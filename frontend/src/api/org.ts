import { apiClient } from "@/lib/api-client";
import type { DepartmentRequest, DepartmentResponse, TagRequest, TagResponse } from "@/types";

export const departmentsApi = {
  list: () => apiClient.get<DepartmentResponse[]>("/departments").then((r) => r.data),
  create: (payload: DepartmentRequest) =>
    apiClient.post<DepartmentResponse>("/departments", payload).then((r) => r.data),
  update: (id: string, payload: DepartmentRequest) =>
    apiClient.put<DepartmentResponse>(`/departments/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/departments/${id}`).then((r) => r.data),
};

export const tagsApi = {
  list: () => apiClient.get<TagResponse[]>("/tags").then((r) => r.data),
  create: (payload: TagRequest) => apiClient.post<TagResponse>("/tags", payload).then((r) => r.data),
  update: (id: string, payload: TagRequest) =>
    apiClient.put<TagResponse>(`/tags/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/tags/${id}`).then((r) => r.data),
};

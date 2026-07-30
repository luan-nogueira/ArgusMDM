import { apiClient } from "@/lib/api-client";
import type {
  PolicyAssignmentRequest,
  PolicyAssignmentResponse,
  PolicyRequest,
  PolicyResponse,
} from "@/types";

export const policiesApi = {
  list: () => apiClient.get<PolicyResponse[]>("/policies").then((r) => r.data),

  create: (payload: PolicyRequest) =>
    apiClient.post<PolicyResponse>("/policies", payload).then((r) => r.data),

  update: (id: string, payload: PolicyRequest) =>
    apiClient.put<PolicyResponse>(`/policies/${id}`, payload).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/policies/${id}`).then((r) => r.data),

  assign: (payload: PolicyAssignmentRequest) =>
    apiClient.post<PolicyAssignmentResponse>("/policies/assignments", payload).then((r) => r.data),

  unassign: (id: string) => apiClient.delete(`/policies/assignments/${id}`).then((r) => r.data),

  effectiveForDevice: (deviceId: string) =>
    apiClient.get<PolicyResponse | null>(`/policies/effective/${deviceId}`).then((r) => r.data),
};

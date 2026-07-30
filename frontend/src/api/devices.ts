import { apiClient } from "@/lib/api-client";
import type {
  CreateDeviceRequest,
  DashboardSummaryResponse,
  DeviceProvisionResponse,
  DeviceResponse,
  DeviceStatus,
  PageResponse,
  UpdateDeviceRequest,
} from "@/types";

export interface DeviceListParams {
  page?: number;
  size?: number;
  status?: DeviceStatus;
  departmentId?: string;
  tagId?: string;
  search?: string;
}

export const devicesApi = {
  list: (params: DeviceListParams = {}) =>
    apiClient
      .get<PageResponse<DeviceResponse>>("/devices", { params: { page: 0, size: 20, ...params } })
      .then((r) => r.data),

  get: (id: string) => apiClient.get<DeviceResponse>(`/devices/${id}`).then((r) => r.data),

  dashboardSummary: () =>
    apiClient.get<DashboardSummaryResponse>("/devices/dashboard/summary").then((r) => r.data),

  create: (payload: CreateDeviceRequest) =>
    apiClient.post<DeviceProvisionResponse>("/devices", payload).then((r) => r.data),

  update: (id: string, payload: UpdateDeviceRequest) =>
    apiClient.put<DeviceResponse>(`/devices/${id}`, payload).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/devices/${id}`).then((r) => r.data),

  regenerateApiKey: (id: string) =>
    apiClient.post<DeviceProvisionResponse>(`/devices/${id}/api-key/regenerate`).then((r) => r.data),

  lock: (id: string) => apiClient.post(`/devices/${id}/lock`).then((r) => r.data),
};

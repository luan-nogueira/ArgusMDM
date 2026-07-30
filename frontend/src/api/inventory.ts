import { apiClient } from "@/lib/api-client";
import type { DeviceMetricResponse, InstalledAppResponse } from "@/types";

export const inventoryApi = {
  apps: (deviceId: string) =>
    apiClient.get<InstalledAppResponse[]>(`/devices/${deviceId}/inventory/apps`).then((r) => r.data),

  latestMetrics: (deviceId: string) =>
    apiClient
      .get<DeviceMetricResponse | null>(`/devices/${deviceId}/inventory/metrics/latest`)
      .then((r) => r.data),
};

import { apiClient } from "@/lib/api-client";
import type { LocationHistoryResponse, PageResponse } from "@/types";

export const locationsApi = {
  history: (deviceId: string, from: string, to: string, page = 0, size = 50) =>
    apiClient
      .get<PageResponse<LocationHistoryResponse>>(`/devices/${deviceId}/locations`, {
        params: { from, to, page, size },
      })
      .then((r) => r.data),

  latest: (deviceId: string) =>
    apiClient
      .get<LocationHistoryResponse | null>(`/devices/${deviceId}/locations/latest`)
      .then((r) => r.data),
};

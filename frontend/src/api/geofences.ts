import { apiClient } from "@/lib/api-client";
import type { GeofenceEventResponse, GeofenceRequest, GeofenceResponse, PageResponse } from "@/types";

export const geofencesApi = {
  list: () => apiClient.get<GeofenceResponse[]>("/geofences").then((r) => r.data),

  create: (payload: GeofenceRequest) =>
    apiClient.post<GeofenceResponse>("/geofences", payload).then((r) => r.data),

  update: (id: string, payload: GeofenceRequest) =>
    apiClient.put<GeofenceResponse>(`/geofences/${id}`, payload).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/geofences/${id}`).then((r) => r.data),

  events: (deviceId: string, page = 0, size = 20) =>
    apiClient
      .get<PageResponse<GeofenceEventResponse>>("/geofences/events", {
        params: { deviceId, page, size },
      })
      .then((r) => r.data),
};

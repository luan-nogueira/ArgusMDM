import { apiClient } from "@/lib/api-client";
import type { AlertResponse, PageResponse } from "@/types";

export const alertsApi = {
  list: (unreadOnly = false, page = 0, size = 20) =>
    apiClient
      .get<PageResponse<AlertResponse>>("/alerts", { params: { unreadOnly, page, size } })
      .then((r) => r.data),

  markRead: (id: string) => apiClient.put(`/alerts/${id}/read`).then((r) => r.data),
};

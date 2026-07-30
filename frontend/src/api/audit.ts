import { apiClient } from "@/lib/api-client";
import type { AuditAction, AuditLogResponse, PageResponse } from "@/types";

export interface AuditLogFilters {
  action?: AuditAction;
  entityType?: string;
  userId?: string;
  from?: string;
  to?: string;
}

export const auditApi = {
  list: (filters: AuditLogFilters = {}, page = 0, size = 20) =>
    apiClient
      .get<PageResponse<AuditLogResponse>>("/logs", { params: { ...filters, page, size } })
      .then((r) => r.data),

  exportPdf: (filters: AuditLogFilters = {}) =>
    apiClient
      .get("/logs/export/pdf", { params: filters, responseType: "blob" })
      .then((r) => r.data as Blob),

  exportExcel: (filters: AuditLogFilters = {}) =>
    apiClient
      .get("/logs/export/excel", { params: filters, responseType: "blob" })
      .then((r) => r.data as Blob),
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

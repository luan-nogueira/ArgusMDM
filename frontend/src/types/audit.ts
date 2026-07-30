import type { AuditAction } from "./enums";

export interface AuditLogResponse {
  id: string;
  userId: string | null;
  userName: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

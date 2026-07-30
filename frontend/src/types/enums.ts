export type UserRole = "ADMIN" | "SUPERVISOR" | "OPERATOR";

export type DeviceStatus = "ONLINE" | "OFFLINE" | "PROVISIONING" | "BLOCKED" | "RETIRED";

export type GeofenceEventType = "ENTER" | "EXIT";

export type AlertType =
  | "DEVICE_OFFLINE"
  | "LOW_BATTERY"
  | "SYNC_FAILURE"
  | "GEOFENCE_BREACH"
  | "POLICY_VIOLATION";

export type UpdatePolicyType = "AUTOMATIC" | "WINDOWED" | "POSTPONE";

export type PolicyTargetType = "DEVICE" | "DEPARTMENT" | "TAG";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "POLICY_APPLIED"
  | "DEVICE_LOCKED"
  | "DEVICE_WIPED";

import type { DeviceStatus } from "./enums";
import type { DepartmentResponse } from "./org";
import type { TagResponse } from "./org";
import type { UserResponse } from "./user";
import type { AlertResponse } from "./alert";
import type { LocationHistoryResponse } from "./location";

export interface DeviceResponse {
  id: string;
  name: string;
  model: string | null;
  manufacturer: string | null;
  androidVersion: string | null;
  imei: string | null;
  serialNumber: string | null;
  status: DeviceStatus;
  lastSyncAt: string | null;
  deviceOwnerActive: boolean;
  department: DepartmentResponse | null;
  responsibleUser: UserResponse | null;
  tags: TagResponse[];
  createdAt: string;
}

export interface CreateDeviceRequest {
  name: string;
  model?: string;
  manufacturer?: string;
  androidVersion?: string;
  imei?: string;
  serialNumber?: string;
  departmentId?: string;
  responsibleUserId?: string;
  tagIds?: string[];
}

export interface UpdateDeviceRequest {
  name: string;
  model?: string;
  manufacturer?: string;
  status: DeviceStatus;
  departmentId?: string;
  responsibleUserId?: string;
  tagIds?: string[];
}

export interface DeviceProvisionResponse {
  deviceId: string;
  apiKey: string;
}

export interface DashboardSummaryResponse {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  lowBatteryDevices: number;
  unreadAlerts: number;
  recentAlerts: AlertResponse[];
  recentLocationsByDevice: Record<string, LocationHistoryResponse>;
}

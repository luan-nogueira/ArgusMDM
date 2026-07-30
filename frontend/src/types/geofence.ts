import type { GeofenceEventType } from "./enums";

export interface GeofenceResponse {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  active: boolean;
  deviceIds: string[];
}

export interface GeofenceRequest {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  active: boolean;
  deviceIds?: string[];
}

export interface GeofenceEventResponse {
  id: string;
  geofenceId: string;
  geofenceName: string;
  deviceId: string;
  deviceName: string;
  type: GeofenceEventType;
  occurredAt: string;
}

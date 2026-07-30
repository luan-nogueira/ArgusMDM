export interface LocationHistoryResponse {
  id: string;
  deviceId: string;
  deviceName: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  capturedAt: string;
}

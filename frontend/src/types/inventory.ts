export interface InstalledAppResponse {
  id: string;
  packageName: string;
  appName: string | null;
  versionName: string | null;
  versionCode: number | null;
  sizeBytes: number | null;
  systemApp: boolean;
}

export interface DeviceMetricResponse {
  batteryLevel: number | null;
  charging: boolean | null;
  storageUsedBytes: number | null;
  storageTotalBytes: number | null;
  memoryUsedBytes: number | null;
  memoryTotalBytes: number | null;
  cpuUsagePercent: number | null;
  wifiConnected: boolean | null;
  wifiSsid: string | null;
  bluetoothEnabled: boolean | null;
  networkOperator: string | null;
  capturedAt: string;
}

import type { AlertType } from "./enums";

export interface AlertResponse {
  id: string;
  type: AlertType;
  deviceId: string | null;
  deviceName: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

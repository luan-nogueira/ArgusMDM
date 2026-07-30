import type { PolicyTargetType, UpdatePolicyType } from "./enums";

export interface PolicyResponse {
  id: string;
  name: string;
  description: string | null;
  passwordRequired: boolean;
  minPasswordLength: number;
  maxInactivityLockMs: number;
  updatePolicy: UpdatePolicyType;
  cameraDisabled: boolean;
  screenCaptureDisabled: boolean;
  factoryResetDisabled: boolean;
  installAppsDisabled: boolean;
  usbFileTransferDisabled: boolean;
  restrictionsJson: string | null;
  active: boolean;
}

export interface PolicyRequest {
  name: string;
  description?: string;
  passwordRequired: boolean;
  minPasswordLength: number;
  maxInactivityLockMs: number;
  updatePolicy: UpdatePolicyType;
  cameraDisabled: boolean;
  screenCaptureDisabled: boolean;
  factoryResetDisabled: boolean;
  installAppsDisabled: boolean;
  usbFileTransferDisabled: boolean;
  restrictionsJson?: string;
  active: boolean;
}

export interface PolicyAssignmentResponse {
  id: string;
  policyId: string;
  policyName: string;
  targetType: PolicyTargetType;
  deviceId: string | null;
  departmentId: string | null;
  tagId: string | null;
}

export interface PolicyAssignmentRequest {
  policyId: string;
  targetType: PolicyTargetType;
  targetId: string;
}
